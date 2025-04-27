import { ContractIntent } from "../../config/types";
import BridgeABI from "../../config/abi/bridgeABI";
import zamaFheBridgeABI from "../../config/abi/zamaFheBridgeABI";
import fhenixFheBridgeABI from "../../config/abi/fhenixFheBridgeABI";
import { PublicClient } from "viem";
import { walletAddress as account } from "../../config/env";
import { fhenixClient, getZamaClient, publicClients, walletClients } from "../../config/client";
import networks from "../../config/networks";
import { sepolia } from "viem/chains";
import { fhenixNitrogen } from "../../config/custom-chains";

export const handleFulfillIntent = async (
  intent: ContractIntent,
  bridgeContract: `0x${string}`,
  publicClient: PublicClient
) => {
  console.log("This intent is mine:", intent);
  console.log("Bridge contract is:", bridgeContract);
  const intentArgs = {
    sender: intent.sender,
    receiver: intent.receiver,
    relayer: intent.relayer,
    inputToken: intent.inputToken,
    outputToken: intent.outputToken,
    inputAmount: intent.inputAmount,
    outputAmount: intent.outputAmount,
    id: intent.id,
    originChainId: intent.originChainId,
    destinationChainId: intent.destinationChainId,
    filledStatus: intent.filledStatus,
  };
  try {
    const { request } = await (publicClient as PublicClient).simulateContract({
      address: bridgeContract,
      abi: BridgeABI,
      functionName: "fulfill",
      args: [intentArgs],
      account,
    });

    const walletClient = walletClients.find((wc) => wc.chainId === intent.destinationChainId)?.client;

    if (!walletClient) {
      throw new Error(`Wallet client for chainId ${intent.destinationChainId} not found`);
    }

    await walletClient.writeContract(request);
  } catch (error) {
    console.error("Error when fulfilling intent:", error);
  }
};

export const handleFulfillIntentZama = async (
  intent: ContractIntent,
  bridgeContract: `0x${string}`,
  publicClient: PublicClient,
  inputAmountSealed: string,
  outputAmountSealed: string
) => {
  console.log("This intent is mine:", intent);
  console.log("Bridge contract is:", bridgeContract);

  const walletClient = walletClients.find((wc) => wc.chainId === intent.destinationChainId)!.client;
  const walletAddress = walletClient.account.address;
  const publicClientDest = publicClients.find((pc) => pc.chainId === intent.destinationChainId)!.client;

  const clearAmount = fhenixClient.unseal(bridgeContract, outputAmountSealed, walletAddress);

  console.log("Clear Amount", clearAmount);

  const zamaClient = await getZamaClient();
  const zamaBridgeContractAddress = networks.find((n) => n.chainId === sepolia.id)!.contracts
    .fheBridgeContract as `0x${string}`;

  const einput = zamaClient.createEncryptedInput(zamaBridgeContractAddress, walletAddress);
  const encrypted = await einput.add64(clearAmount).encrypt();
  const intentArgs = {
    sender: intent.sender,
    receiver: intent.receiver,
    relayer: intent.relayer,
    inputToken: intent.inputToken,
    outputToken: intent.outputToken,
    inputAmount: BigInt(0),
    outputAmount: BigInt(0),
    id: intent.id,
    originChainId: intent.originChainId,
    destinationChainId: intent.destinationChainId,
    filledStatus: intent.filledStatus,
  };
  try {
    const { request } = await (publicClientDest as PublicClient).simulateContract({
      address: zamaBridgeContractAddress,
      abi: zamaFheBridgeABI,
      functionName: "fulfill",
      args: [
        intentArgs,
        `0x${Buffer.from(encrypted.handles[0]).toString("hex")}`,
        `0x${Buffer.from(encrypted.inputProof).toString("hex")}`,
      ],
      account,
    });

    const walletClient = walletClients.find((wc) => wc.chainId === intent.destinationChainId)?.client;

    if (!walletClient) {
      throw new Error(`Wallet client for chainId ${intent.destinationChainId} not found`);
    }

    await walletClient.writeContract(request);
  } catch (error) {
    console.error("Error when fulfilling intent:", error);
  }
};

export const handleFulfillIntentFhenix = async (
  intent: ContractIntent,
  bridgeContract: `0x${string}`,
  publicClient: PublicClient
) => {
  console.log("This intent is mine:", intent);
  console.log("Bridge contract is:", bridgeContract);

  const walletClientSource = walletClients.find((wc) => wc.chainId === intent.originChainId)!.client;
  const walletClientDest = walletClients.find((wc) => wc.chainId === intent.destinationChainId)!.client;
  const walletAddress = walletClientSource.account.address;
  const publicClientDest = publicClients.find((pc) => pc.chainId === intent.destinationChainId)!.client;

  const zamaClient = await getZamaClient();

  const { publicKey, privateKey } = zamaClient.generateKeypair();
  const eip712 = zamaClient.createEIP712(publicKey, bridgeContract);
  const signature = await walletClientSource.signTypedData({
    domain: eip712.domain,
    types: { Reencrypt: eip712.types.Reencrypt },
    message: eip712.message,
    primaryType: "Reencrypt",
  });

  const userDecryptedAmount = await zamaClient.reencrypt(
    intent.outputAmount,
    privateKey,
    publicKey,
    signature,
    bridgeContract,
    walletAddress
  );

  const readableAmount = userDecryptedAmount.toString();
  console.log("Clear Amount", readableAmount);

  const encryptedAmount = await fhenixClient.encrypt_uint64(BigInt(readableAmount));
  console.log("Encrypted Amount", encryptedAmount);

  const fhenixBridgeContractAddress = networks.find((n) => n.chainId === fhenixNitrogen.id)!.contracts
    .fheBridgeContract as `0x${string}`;

  const intentArgs = {
    sender: intent.sender,
    receiver: intent.receiver,
    relayer: intent.relayer,
    inputToken: intent.inputToken,
    outputToken: intent.outputToken,
    inputAmount: intent.inputAmount,
    outputAmount: intent.outputAmount,
    id: intent.id,
    originChainId: intent.originChainId,
    destinationChainId: intent.destinationChainId,
    filledStatus: intent.filledStatus,
  };
  try {
    if (!walletClientDest) {
      throw new Error(`Wallet client for chainId ${intent.destinationChainId} not found`);
    }

    await walletClientDest.writeContract({
      address: fhenixBridgeContractAddress,
      abi: fhenixFheBridgeABI,
      functionName: "fulfill",
      args: [intentArgs, { ...encryptedAmount, data: `0x${Buffer.from(encryptedAmount.data).toString("hex")}` }],
    });
  } catch (error) {
    console.error("Error when fulfilling intent:", error);
  }
};
