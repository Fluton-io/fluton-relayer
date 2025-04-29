import BridgeABI from "../config/abi/bridgeABI";
import zamaFheBridgeABI from "../config/abi/zamaFheBridgeABI";
import fhenixFheBridgeABI from "../config/abi/fhenixFheBridgeABI";
import networks from "../config/networks";
import { websocketClients } from "../config/client";
import { walletAddress } from "../config/env";
import { handleFulfillIntent, handleFulfillIntentFhenix, handleFulfillIntentZama } from "./listener/listenerUtils";
import { PublicClient } from "viem";
import { fhenixNitrogen } from "../config/custom-chains";

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
          if (logs[0].args.intent!.relayer === walletAddress) {
            handleFulfillIntent(
              logs[0].args.intent!,
              network.contracts.bridgeContract as `0x${string}`,
              client as PublicClient
            );
          }
        },
      });
    }

    // confidential bridge contract
    if (network && network.contracts.fheBridgeContract) {
      console.log(`Listening for events on chainId: ${chainId}, contract: ${network.contracts.fheBridgeContract}`);

      if (network.chainId === fhenixNitrogen.id) {
        // fhenix co-processor
        client.watchContractEvent({
          address: network.contracts.fheBridgeContract as `0x${string}`,
          abi: fhenixFheBridgeABI,
          eventName: "IntentCreated",
          onLogs: (logs) => {
            const { intent, inputAmountSealed, outputAmountSealed } = logs[0].args;
            if (intent?.relayer === walletAddress) {
              handleFulfillIntentZama(
                intent,
                network.contracts.fheBridgeContract as `0x${string}`,
                outputAmountSealed!
              );
            }
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
        });
      }
    }

    return () => {};
  });

  return unwatchList;
};
