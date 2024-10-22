import { ContractIntent } from "../../config/types";
import BridgeABI from "../../config/bridgeABI";
import { PublicClient } from "viem";
import { walletAddress as account } from "../../config/env";
import { walletClients } from "../../config/client";

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
