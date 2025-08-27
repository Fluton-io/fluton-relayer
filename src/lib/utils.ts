import networks from "../config/networks";
import { publicClients } from "../config/client";
import { Account, erc20Abi, WalletClient } from "viem";
import { FeeSchema } from "../config/types";
import feeSchemaData from "../config/feeSchema.json";
import { AddressLike, BaseContract, BigNumberish, BytesLike, Signature, Signer, TypedDataDomain } from "ethers";
import { FheTypes } from "cofhejs/node";
import { readContract } from "viem/actions";
import fhenixEERC20ABI from "../config/abi/fhenixEERC20";

export const getRpcUrlByChainId = (chainId: number): string => {
  const network = networks.find((network) => network.chainId === chainId);
  if (!network) {
    throw new Error(`Network with chainId ${chainId} not found`);
  }
  return network.rpcUrl;
};

export const fetchTokenDecimals = async (tokenAddress: `0x${string}`, chainId: number) => {
  try {
    const publicClient = publicClients.find((client) => client.chainId === chainId);

    if (!publicClient) {
      throw new Error(`Public client not found for chainId: ${chainId}`);
    }

    const decimals = await publicClient.client.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "decimals",
    });

    return decimals;
  } catch (error) {
    console.error(`Failed to fetch decimals for token: ${tokenAddress}`, error);
    throw new Error("Unable to fetch token decimals");
  }
};

export const fetchTokenSymbol = async (tokenAddress: `0x${string}`, chainId: number) => {
  try {
    const publicClient = publicClients.find((client) => client.chainId === chainId);

    if (!publicClient) {
      throw new Error(`Public client not found for chainId: ${chainId}`);
    }

    const symbol = await publicClient.client.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "symbol",
    });

    return symbol;
  } catch (error) {
    console.error(`Failed to fetch symbol for token: ${tokenAddress}`, error);
    throw new Error("Unable to fetch token symbol");
  }
};

export const feeSchema: FeeSchema = feeSchemaData;
export const aggregator = feeSchema.aggregator;

// temporary function for generating transfer from permit, delete when fhenix team adds this to sdk
interface FHERC20 extends BaseContract {
  eip712Domain: any;
  nonces: any;
}

type GeneratePermitOptions = {
  walletClient: WalletClient;
  tokenAddress: `0x${string}`;
  spender: `0x${string}`;
  valueHash: bigint;
  nonce?: bigint;
  deadline?: bigint;
};

export const getNowTimestamp = () => {
  return BigInt(Date.now()) / 1000n;
};

type FHERC20_EIP712_PermitStruct = {
  owner: `0x${string}`;
  spender: `0x${string}`;
  value_hash: bigint;
  deadline: bigint;
  v: number;
  r: `0x${string}`;
  s: `0x${string}`;
};

export const generateTransferFromPermit = async (
  options: GeneratePermitOptions
): Promise<FHERC20_EIP712_PermitStruct> => {
  let { walletClient, tokenAddress, spender, valueHash, nonce, deadline } = options;
  const signer = walletClient.account;
  const owner = signer!.address;

  const [_, name, version, chainId, verifyingContract] = await readContract(walletClient, {
    address: tokenAddress,
    abi: fhenixEERC20ABI,
    functionName: "eip712Domain",
  });

  // If nonce is not provided, get it from the token
  if (nonce == null)
    nonce = await readContract(walletClient, {
      address: tokenAddress,
      abi: fhenixEERC20ABI,
      functionName: "nonces",
      args: [owner as `0x${string}`],
    });

  // If deadline is not provided, set it to 24 hours from now
  if (deadline == null) deadline = getNowTimestamp() + BigInt(24 * 60 * 60);

  const domain = {
    name,
    version,
    chainId: Number(chainId),
    verifyingContract,
  };

  const types = {
    Permit: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
      { name: "value_hash", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
  };

  const message = {
    owner,
    spender,
    value_hash: valueHash,
    nonce: nonce,
    deadline: deadline,
  };

  const signature = await signer!.signTypedData!({ domain, types, message, primaryType: "Permit" });
  const { v, r, s } = Signature.from(signature);

  return {
    owner,
    spender,
    value_hash: valueHash,
    deadline: deadline,
    v,
    r: r as `0x${string}`,
    s: s as `0x${string}`,
  };
};
// Reserve 2 bytes for metadata (clears last 2 bytes of 256-bit word)
const HASH_MASK_FOR_METADATA = (1n << 256n) - 1n - 0xffffn; // 0xffff = 2^16 - 1

// Reserve 1 byte for security zone (lowest byte)
const SECURITY_ZONE_MASK = 0xffn; // type(uint8).max

// 7-bit uint type mask
const UINT_TYPE_MASK = 0xff >> 1; // 0x7f

// 1-bit trivially encrypted flag (MSB of a byte)
const TRIVIALLY_ENCRYPTED_MASK = 0xff - UINT_TYPE_MASK; // 0x80

// uintType mask positioned in the second-to-last byte
const SHIFTED_TYPE_MASK = BigInt(UINT_TYPE_MASK) << 8n; // 0x7f00n

// Helper function to encode isTrivial + uintType into a byte
const getByteForTrivialAndType = (isTrivial: boolean, uintType: number): number => {
  return (isTrivial ? TRIVIALLY_ENCRYPTED_MASK : 0x00) | (uintType & UINT_TYPE_MASK);
};

// Main function to append metadata
export const appendMetadata = (
  preCtHash: bigint,
  securityZone: number,
  uintType: number,
  isTrivial: boolean
): bigint => {
  const result = preCtHash & HASH_MASK_FOR_METADATA;

  // Emulate uint8(int8(securityZone)) in Solidity
  const securityZoneByte = BigInt(((securityZone << 24) >> 24) & 0xff);

  const metadata = (BigInt(getByteForTrivialAndType(isTrivial, uintType)) << 8n) | securityZoneByte;

  return result | metadata;
};

// Utility function that accepts an encrypted input
export const appendMetadataToInput = (encryptedInput: {
  ctHash: bigint;
  securityZone: number;
  utype: FheTypes;
}): bigint => {
  return appendMetadata(encryptedInput.ctHash, encryptedInput.securityZone, encryptedInput.utype, false);
};

// temporary part ends here
