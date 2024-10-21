import BridgeABI from "../config/bridgeABI";
import networks from "../config/networks";
import { mainnetPublicClient, sepoliaPublicClient } from "../config/client";

export const listenBridgeEvents = () => {
  const sepoliaUnwatch = sepoliaPublicClient.watchContractEvent({
    address: networks.find((network) => network.chainId === 11155111)!.bridgeContract as `0x${string}`,
    abi: BridgeABI,
    eventName: "IntentCreated",
    onLogs: (logs) => console.log(logs[0].args.intent),
  });

  const mainnetUnwatch = mainnetPublicClient.watchContractEvent({
    address: networks.find((network) => network.chainId === 1)!.bridgeContract as `0x${string}`,
    abi: BridgeABI,
    eventName: "IntentCreated",
    onLogs: (logs) => console.log(logs[0].args.intent),
  });
};
