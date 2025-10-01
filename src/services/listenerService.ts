import BridgeABI from "../config/abi/bridgeABI";
import zamaFheBridgeABI from "../config/abi/zamaFheBridgeABI";
import fhenixFheBridgeABI from "../config/abi/fhenixFheBridgeABI";
import networks from "../config/networks";
import { websocketClients } from "../config/client";
import { walletAddress } from "../config/env";
import {
  handleFulfillIntent,
  handleFulfillIntentFhenix /* , handleFulfillIntentZama */,
} from "./listener/listenerUtils";
import { Coprocessor } from "../config/types";

export const listenBridgeEvents = () => {
  const unwatchList: (() => void)[] = websocketClients.map(({ client, chainId }) => {
    const network = networks.find((network) => network.chainId === chainId);

    if (network && network.contracts.bridgeContract) {
      console.log(`Listening for events on chainId: ${chainId}, contract: ${network.contracts.bridgeContract.address}`);

      client.watchContractEvent({
        address: network.contracts.bridgeContract.address as `0x${string}`,
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
      console.log(
        `Listening for events on chainId: ${chainId}, contract: ${network.contracts.fheBridgeContract.address}`
      );

      if (network.contracts.fheBridgeContract.coprocessor === Coprocessor.FHENIX) {
        // fhenix co-processor
        client.watchContractEvent({
          address: network.contracts.fheBridgeContract.address as `0x${string}`,
          abi: fhenixFheBridgeABI,
          eventName: "IntentCreated",
          onLogs: (logs) => {
            const { intent } = logs[0].args;
            if (intent?.relayer === walletAddress) {
              const targetBridgeContract = networks.find((n) => n.chainId === intent.destinationChainId)?.contracts
                ?.fheBridgeContract;
              if (!targetBridgeContract) {
                return console.error(`FHE Bridge contract for chainId ${intent.destinationChainId} not found`);
              }
              if (targetBridgeContract.coprocessor === Coprocessor.ZAMA) {
                /* handleFulfillIntentZama(intent); */
              } else if (targetBridgeContract.coprocessor === Coprocessor.FHENIX) {
                handleFulfillIntentFhenix(intent);
              }
            }
          },
          onError(error) {
            console.error("Error watching event:", error);
          },
        });
      } else if (network.contracts.fheBridgeContract.coprocessor === Coprocessor.ZAMA) {
        // zama co-processor
        client.watchContractEvent({
          address: network.contracts.fheBridgeContract.address as `0x${string}`,
          abi: zamaFheBridgeABI,
          eventName: "IntentCreated",
          onLogs: (logs) => {
            const { intent } = logs[0].args;
            const modifiedIntent = {
              ...intent!,
              inputAmount: BigInt(intent!.inputAmount),
              outputAmount: BigInt(intent!.outputAmount),
            };
            if (intent?.relayer === walletAddress) {
              handleFulfillIntentFhenix(modifiedIntent);
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
