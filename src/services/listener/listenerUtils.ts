import { ContractIntent } from "../../config/types";
import BridgeABI from "../../config/abi/bridgeABI";
import zamaFheBridgeABI from "../../config/abi/zamaFheBridgeABI";
import fhenixFheBridgeABI from "../../config/abi/fhenixFheBridgeABI";
import { getZamaClient, walletClients } from "../../config/client";
import { cofhejs, FheTypes } from "cofhejs/dist/node";
import networks from "../../config/networks";
import { sepolia } from "viem/chains";
import { fhenixNitrogen } from "../../config/custom-chains";

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

export const handleFulfillIntentZama = async (intent: ContractIntent, outputAmountSealed: string) => {
  console.log("This intent is mine:", intent);

  const walletClient = walletClients.find((wc) => wc.chainId === intent.destinationChainId)?.client;
  if (!walletClient) {
    throw new Error(`Wallet client for chainId ${intent.destinationChainId} not found`);
  }
  const walletAddress = walletClient.account.address;

  const clearAmountResult = await cofhejs.unseal(BigInt(outputAmountSealed), FheTypes.Uint64);
  if (!clearAmountResult.success) {
    throw new Error("Failed to unseal the output amount");
  }

  console.log("Clear Amount", clearAmountResult.data);

  const zamaClient = await getZamaClient();
  const zamaBridgeContractAddress = networks.find((n) => n.chainId === sepolia.id)!.contracts
    .fheBridgeContract as `0x${string}`;

  const buffer = zamaClient.createEncryptedInput(zamaBridgeContractAddress, walletAddress);
  const encrypted = await buffer.add64(clearAmountResult.data).encrypt();
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
  const handleContractPairs = [
    {
      handle: intent.outputAmount.toString(),
      contractAddress: bridgeContractSrc,
    },
  ];
  const contractAddresses = [bridgeContractSrc];
  const startTimeStamp = Math.floor(Date.now() / 1000).toString();
  const durationDays = "10"; // String for consistency
  const eip712 = zamaClient.createEIP712(publicKey, contractAddresses, startTimeStamp, durationDays);

  const signature = await walletClientSource.signTypedData({
    // @ts-expect-error string is actually 0xstring
    domain: eip712.domain,
    types: { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
    message: eip712.message,
    primaryType: "UserDecryptRequestVerification",
  });

  const userDecryptedAmount = await zamaClient.userDecrypt(
    handleContractPairs,
    privateKey,
    publicKey,
    signature.replace("0x", ""),
    contractAddresses,
    walletAddress,
    startTimeStamp,
    durationDays
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

    const tx = await walletClientDest.writeContract({
      address: fhenixBridgeContractAddress,
      abi: fhenixFheBridgeABI,
      functionName: "fulfill",
      args: [intentArgs, { ...encryptedAmount, data: `0x${Buffer.from(encryptedAmount.data).toString("hex")}` }],
    });
    console.log("Transaction sent, hash:", tx);
  } catch (error) {
    console.error("Error when fulfilling intent:", error);
  }
};
