import BridgeABI from "../config/bridgeABI";
import networks from "../config/networks";
import { publicClients } from "../config/client";
import { walletAddress } from "../config/env";
import { handleFulfillIntent } from "./listener/listenerUtils";
import { PublicClient } from "viem";

export const listenBridgeEvents = () => {
  const unwatchList: (() => void)[] = publicClients.map(({ client, chainId }) => {
    const network = networks.find((network) => network.chainId === chainId);

    if (network && network.bridgeContract) {
      console.log(`Listening for events on chainId: ${chainId}, contract: ${network.bridgeContract}`);

      return client.watchContractEvent({
        address: network.bridgeContract as `0x${string}`,
        abi: BridgeABI,
        eventName: "IntentCreated",
        onLogs: (logs) => {
          if (logs[0].args.intent!.relayer === walletAddress) {
            handleFulfillIntent(logs[0].args.intent!, network.bridgeContract as `0x${string}`, client as PublicClient);
          }
        },
      });
    }
    return () => {};
  });

  return unwatchList;
};
