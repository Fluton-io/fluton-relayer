import { ContractIntent, Coprocessor } from "../../config/types";
import BridgeABI from "../../config/abi/bridgeABI";
import ZamaBridgeABI from "../../config/abi/zamaFheBridgeABI";
import FhenixBridgeABI from "../../config/abi/fhenixFheBridgeABI";
import zamaFheBridgeABI from "../../config/abi/zamaFheBridgeABI";
import { /* getZamaClient, */ publicClients, walletClients } from "../../config/client";
import { cofhejs, FheTypes, Encryptable, CoFheInUint128 } from "cofhejs/node";
import networks from "../../config/networks";
import { arbitrumSepolia, sepolia } from "viem/chains";
import { appendMetadataToInput, generateTransferFromPermit } from "../../lib/utils";

export const handleFulfillIntent = async (intent: ContractIntent) => {
  console.log("This intent is mine:", intent);
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
    const bridgeContractDest = networks.find((n) => n.chainId === intent.destinationChainId)?.contracts.bridgeContract
      .address as `0x${string}`;
    if (!bridgeContractDest) {
      throw new Error(`Bridge contract for chainId ${intent.destinationChainId} not found`);
    }
    console.log("Bridge contract is:", bridgeContractDest);

    const walletClientDest = walletClients.find((wc) => wc.chainId === intent.destinationChainId)?.client;
    if (!walletClientDest) {
      throw new Error(`Wallet client for chainId ${intent.destinationChainId} not found`);
    }

    await walletClientDest.writeContract({
      address: bridgeContractDest,
      abi: BridgeABI,
      functionName: "fulfill",
      args: [intentArgs],
    });
  } catch (error) {
    console.error("Error when fulfilling intent:", error);
  }
};

/* export const handleFulfillIntentZama = async (intent: ContractIntent) => {
  console.log("This intent is mine:", intent);

  const walletClient = walletClients.find((wc) => wc.chainId === intent.destinationChainId)?.client;
  1;
  if (!walletClient) {
    throw new Error(`Wallet client for chainId ${intent.destinationChainId} not found`);
  }
  const walletAddress = walletClient.account.address;

  const clearAmountResult = await cofhejs.unseal(BigInt(intent.outputAmount), FheTypes.Uint128);
  if (!clearAmountResult.success) {
    throw new Error("Failed to unseal the output amount");
  }

  console.log("Clear Amount", clearAmountResult.data);

  const zamaClient = await getZamaClient();
  const zamaBridgeContractAddress = networks.find((n) => n.chainId === sepolia.id)!.contracts.fheBridgeContract
    .address as `0x${string}`;

  const encrypted = await zamaClient
    .createEncryptedInput(zamaBridgeContractAddress, walletAddress)
    .add64(clearAmountResult.data)
    .encrypt();
  const intentArgs = {
    sender: intent.sender,
    receiver: intent.receiver,
    relayer: intent.relayer,
    inputToken: intent.inputToken,
    outputToken: intent.outputToken,
    inputAmount: BigInt(0).toString(16) as `0x${string}`,
    outputAmount: BigInt(0).toString(16) as `0x${string}`,
    id: intent.id,
    originChainId: intent.originChainId,
    destinationChainId: intent.destinationChainId,
    filledStatus: intent.filledStatus,
  };
  try {
    const walletClientDest = walletClients.find((wc) => wc.chainId === intent.destinationChainId)?.client;

    if (!walletClientDest) {
      throw new Error(`Wallet client for chainId ${intent.destinationChainId} not found`);
    }

    await walletClientDest.writeContract({
      address: zamaBridgeContractAddress,
      abi: zamaFheBridgeABI,
      functionName: "fulfill",
      args: [
        intentArgs,
        `0x${Buffer.from(encrypted.handles[0]).toString("hex")}`,
        `0x${Buffer.from(encrypted.inputProof).toString("hex")}`,
      ],
    });
  } catch (error) {
    console.error("Error when fulfilling intent:", error);
  }
}; */

export const handleFulfillIntentFhenix = async (intent: ContractIntent) => {
  console.log("This intent is mine:", intent);

  const walletClientSource = walletClients.find((wc) => wc.chainId === intent.originChainId)!.client;
  const publicClientSource = publicClients.find((pc) => pc.chainId === intent.originChainId)!.client;
  const walletClientDest = walletClients.find((wc) => wc.chainId === intent.destinationChainId)!.client;
  const publicClientDest = publicClients.find((pc) => pc.chainId === intent.destinationChainId)!.client;
  const bridgeContractSrc = networks.find((n) => n.chainId === intent.originChainId)?.contracts.fheBridgeContract
    .address as `0x${string}`;
  const walletAddress = walletClientSource.account.address;
  const bridgeContractSrcCoprocessor = networks.find((n) => n.chainId === intent.originChainId)?.contracts
    .fheBridgeContract.coprocessor;

  if (!bridgeContractSrcCoprocessor) {
    throw new Error(`Coprocessor for bridge contract on chainId ${intent.originChainId} not found`);
  }

  const fhenixBridgeContractAddress = networks.find((n) => n.chainId === intent.destinationChainId)!.contracts
    .fheBridgeContract.address as `0x${string}`;
  const fhenixEUSDCAddress = networks.find((n) => n.chainId === intent.destinationChainId)!.contracts.eUSDC
    .address as `0x${string}`;

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
    solverPaid: false,
    timeout: 0n,
  };

  let encryptedAmount: CoFheInUint128 = {
    ctHash: intent.outputAmount,
    utype: FheTypes.Uint128,
    securityZone: 0,
    signature: "",
  };
  // if source coprocessor is fhenix, no need for decryption
  if (bridgeContractSrcCoprocessor === Coprocessor.FHENIX) {
    console.log("Fhenix to Fhenix transfer, no decryption needed, but decrypting for now");
    const permit = await cofhejs.initializeWithViem({
      viemClient: publicClientSource,
      viemWalletClient: walletClientSource,
      environment: "TESTNET",
    });
    if (!permit) {
      throw new Error("Invalid Permit");
    }
    const clearAmountResult = await cofhejs.unseal(
      intent.outputAmount,
      FheTypes.Uint128,
      walletClientSource.account.address,
      permit.data?.getHash()
    );
    if (!clearAmountResult.success) {
      throw new Error("Failed to unseal the output amount");
    }

    console.log("Clear Amount", clearAmountResult.data);
    await cofhejs.initializeWithViem({
      viemClient: publicClientDest,
      viemWalletClient: walletClientDest,
      environment: "TESTNET",
    });
    const encrypted = await cofhejs.encrypt([Encryptable.uint128(clearAmountResult.data)]);
    encryptedAmount = encrypted.data![0];
  }
  // if source coprocessor is zama, we have to decrypt and re-encrypt
  /* else if (bridgeContractSrcCoprocessor === Coprocessor.ZAMA) {
    const zamaClient = await getZamaClient();

    const { publicKey, privateKey } = zamaClient.generateKeypair();
    const outputAmountHex = "0x" + intent.outputAmount.toString(16);
    const handleContractPairs = [
      {
        handle: outputAmountHex,
        contractAddress: bridgeContractSrc,
      },
    ];
    const contractAddresses = [bridgeContractSrc];
    const startTimeStamp = Math.floor(Date.now() / 1000).toString();
    const durationDays = "10"; // String for consistency
    const eip712 = zamaClient.createEIP712(publicKey, contractAddresses, startTimeStamp, durationDays);

    const signature = await walletClientSource.signTypedData({
      domain: { ...eip712.domain, verifyingContract: eip712.domain.verifyingContract as `0x${string}` },
      types: { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
      message: eip712.message,
      primaryType: "UserDecryptRequestVerification",
    });

    const userDecryptedAmountResult = await zamaClient.userDecrypt(
      handleContractPairs,
      privateKey,
      publicKey,
      signature.replace("0x", ""),
      contractAddresses,
      walletAddress,
      startTimeStamp,
      durationDays
    );

    const readableAmount = userDecryptedAmountResult[outputAmountHex];
    console.log(userDecryptedAmountResult);
    console.dir(userDecryptedAmountResult);
    console.log("Clear Amount", readableAmount);

    const encrypted = await cofhejs.encrypt([Encryptable.uint128(BigInt(readableAmount))]);
    encryptedAmount = encrypted.data![0];
  } */
  try {
    if (!walletClientDest) {
      throw new Error(`Wallet client for chainId ${intent.destinationChainId} not found`);
    }

    // permit creation
    const encTransferCtHashWMetadata = appendMetadataToInput(encryptedAmount);
    const permit = await generateTransferFromPermit({
      walletClient: walletClientDest,
      tokenAddress: fhenixEUSDCAddress,
      spender: fhenixBridgeContractAddress,
      valueHash: encTransferCtHashWMetadata,
    });

    const tx = await walletClientDest.writeContract({
      address: fhenixBridgeContractAddress,
      abi: FhenixBridgeABI,
      functionName: "fulfill",
      args: [intentArgs, { ...encryptedAmount, signature: encryptedAmount.signature as `0x${string}` }, permit],
    });
    console.log("Transaction sent, hash:", tx);
  } catch (error) {
    console.error("Error when fulfilling intent:", error);
  }
};
