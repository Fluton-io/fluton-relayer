import { ContractIntent } from "../../config/types";
import BridgeABI from "../../config/abi/bridgeABI";
import ZamaBridgeABI from "../../config/abi/zamaFheBridgeABI";
import FhenixBridgeABI from "../../config/abi/fhenixFheBridgeABI";
import zamaFheBridgeABI from "../../config/abi/zamaFheBridgeABI";
import { getZamaClient, walletClients } from "../../config/client";
import { cofhejs, FheTypes, Encryptable } from "cofhejs/node";
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
    const bridgeContractDest = networks.find((n) => n.chainId === intent.destinationChainId)?.contracts
      .bridgeContract as `0x${string}`;
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

export const handleFulfillIntentZama = async (intent: ContractIntent) => {
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
  const zamaBridgeContractAddress = networks.find((n) => n.chainId === sepolia.id)!.contracts
    .fheBridgeContract as `0x${string}`;

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
};

export const handleFulfillIntentFhenix = async (intent: ContractIntent) => {
  console.log("This intent is mine:", intent);

  const walletClientSource = walletClients.find((wc) => wc.chainId === intent.originChainId)!.client;
  const walletClientDest = walletClients.find((wc) => wc.chainId === intent.destinationChainId)!.client;
  const bridgeContractSrc = networks.find((n) => n.chainId === intent.originChainId)?.contracts
    .fheBridgeContract as `0x${string}`;
  const walletAddress = walletClientSource.account.address;

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
  const encryptedAmount = encrypted.data![0];
  const fhenixBridgeContractAddress = networks.find((n) => n.chainId === arbitrumSepolia.id)!.contracts
    .fheBridgeContract as `0x${string}`;
  const fhenixEERC20TokenAddress = networks.find((n) => n.chainId === arbitrumSepolia.id)!.contracts
    .eERC20 as `0x${string}`;

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
  try {
    if (!walletClientDest) {
      throw new Error(`Wallet client for chainId ${intent.destinationChainId} not found`);
    }

    // permit creation
    const encTransferCtHashWMetadata = appendMetadataToInput(encryptedAmount);
    const permit = await generateTransferFromPermit({
      walletClient: walletClientDest,
      tokenAddress: fhenixEERC20TokenAddress,
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
