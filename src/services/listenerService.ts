import BridgeABI from "../config/abi/bridgeABI";
import fhevmBridgeABI from "../config/abi/fhevmBridgeABI";
import cofheBridgeABI from "../config/abi/cofheBridgeABI";
import networks from "../config/networks";
import { websocketClients } from "../config/client";
import { walletAddress } from "../config/env";
import {
  handleIntentCreatedFhenix,
  handleIntentCreatedZama,
  handleIntentCreatedPublic,
} from "./listener/listenerUtils";

export const listenBridgeEvents = () => {
  const unwatchList: (() => void)[] = websocketClients.map(({ client, chainId }) => {
    const network = networks.find((network) => network.chainId === chainId);

    if (network && network.contracts.publicBridge) {
      console.log(`Listening for events on chainId: ${chainId}, contract: ${network.contracts.publicBridge.address}`);

      client.watchContractEvent({
        address: network.contracts.publicBridge.address as `0x${string}`,
        abi: BridgeABI,
        eventName: "IntentCreated",
        onLogs: (logs) => {
          const { intent } = logs[0].args;
          if (intent?.relayer === walletAddress) {
            handleIntentCreatedPublic(intent!);
          }
        },
        onError(error) {
          console.error("Error watching event:", error);
        },
      });
    }

    // fhenix bridge contract
    if (network && network.contracts.cofheBridge) {
      console.log(
        `Listening for events on chainId: ${chainId}, fhenix bridge contract: ${network.contracts.cofheBridge.address}`
      );

      // fhenix co-processor
      client.watchContractEvent({
        address: network.contracts.cofheBridge.address as `0x${string}`,
        abi: cofheBridgeABI,
        eventName: "IntentCreated",
        onLogs: (logs) => {
          console.log("Caught IntentCreated event on fhenix bridge");
          const { intent } = logs[0].args;
          if (intent && intent?.relayer === walletAddress) {
            handleIntentCreatedFhenix(intent);
          }
        },
        onError(error) {
          console.error("Error watching event:", error);
        },
      });
    }

    // fhevm bridge contract
    if (network && network.contracts.fhevmBridge) {
      console.log(
        `Listening for events on chainId: ${chainId}, fhevm bridge contract: ${network.contracts.fhevmBridge.address}`
      );
      client.watchContractEvent({
        address: network.contracts.fhevmBridge.address as `0x${string}`,
        abi: fhevmBridgeABI,
        eventName: "IntentCreated",
        onLogs: (logs) => {
          console.log("Caught IntentCreated event on fhevm bridge");
          const { intent } = logs[0].args;
          const modifiedIntent = {
            ...intent!,
            inputAmount: BigInt(intent!.inputAmount),
            outputAmount: BigInt(intent!.outputAmount),
            destinationChainId: BigInt(intent!.destinationChainId),
          };
          if (modifiedIntent && modifiedIntent?.relayer === walletAddress) {
            handleIntentCreatedZama(modifiedIntent);
            return;
          }
        },
        onError(error) {
          console.error("Error watching event:", error);
        },
      });
    }

    return () => {};
  });

  return unwatchList;
};
