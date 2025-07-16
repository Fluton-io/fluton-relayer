import BridgeABI from "../config/abi/bridgeABI";
import zamaFheBridgeABI from "../config/abi/zamaFheBridgeABI";
import fhenixFheBridgeABI from "../config/abi/fhenixFheBridgeABI";
import networks from "../config/networks";
import { websocketClients } from "../config/client";
import { walletAddress } from "../config/env";
import { handleFulfillIntent, handleFulfillIntentFhenix, handleFulfillIntentZama } from "./listener/listenerUtils";
import { PublicClient } from "viem";
import { arbitrumSepolia } from "viem/chains";

export const listenBridgeEvents = () => {
  const unwatchList: (() => void)[] = websocketClients.map(({ client, chainId }) => {
    const network = networks.find((network) => network.chainId === chainId);

    if (network && network.contracts.bridgeContract) {
      console.log(`Listening for events on chainId: ${chainId}, contract: ${network.contracts.bridgeContract}`);

      client.watchContractEvent({
        address: network.contracts.bridgeContract as `0x${string}`,
        abi: BridgeABI,
        eventName: "IntentCreated",
        onLogs: (logs) => {
          const { intent } = logs[0].args;
          if (intent?.relayer === walletAddress) {
            handleFulfillIntent(intent!);
          }
        },
        onError(error) {
          console.error("Error watching event:", error);
        },
      });
    }

    // confidential bridge contract
    if (network && network.contracts.fheBridgeContract) {
      console.log(`Listening for events on chainId: ${chainId}, contract: ${network.contracts.fheBridgeContract}`);

      if (network.chainId === arbitrumSepolia.id) {
        // fhenix co-processor
        client.watchContractEvent({
          address: network.contracts.fheBridgeContract as `0x${string}`,
          abi: fhenixFheBridgeABI,
          eventName: "IntentCreated",
          onLogs: (logs) => {
            const { intent, inputAmountSealed, outputAmountSealed } = logs[0].args;
            if (intent?.relayer === walletAddress) {
              handleFulfillIntentZama(intent, outputAmountSealed!);
            }
          },
          onError(error) {
            console.error("Error watching event:", error);
          },
        });
      } else {
        // zama co-processor
        client.watchContractEvent({
          address: network.contracts.fheBridgeContract as `0x${string}`,
          abi: zamaFheBridgeABI,
          eventName: "IntentCreated",
          onLogs: (logs) => {
            const { intent } = logs[0].args;
            if (intent?.relayer === walletAddress) {
              handleFulfillIntentFhenix(intent, network.contracts.fheBridgeContract as `0x${string}`);
            }
          },
          onError(error) {
            console.error("Error watching event:", error);
          },
        });
      }
    }

    return () => {};
  });

  return unwatchList;
};
