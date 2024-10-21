import BridgeABI from "../config/bridgeABI";
import networks from "../config/networks";
import {
  arbitrumPublicClient,
  arbitrumSepoliaPublicClient,
  mainnetPublicClient,
  optimismPublicClient,
  optimismSepoliaPublicClient,
  scrollPublicClient,
  scrollSepoliaPublicClient,
  sepoliaPublicClient,
} from "../config/client";
import { walletAddress } from "../config/env";

export const listenBridgeEvents = () => {
  //mainnets
  const mainnetUnwatch = mainnetPublicClient.watchContractEvent({
    address: networks.find((network) => network.chainId === 1)!.bridgeContract as `0x${string}`,
    abi: BridgeABI,
    eventName: "IntentCreated",
    onLogs: (logs) => {
      //console.log(logs[0].args.intent);
      if (logs[0].args.intent!.relayer === walletAddress) {
        console.log("This intent is mine:", logs[0].args.intent);
        handleFulfill();
      }
    },
  });

  const arbitrumUnwatch = arbitrumPublicClient.watchContractEvent({
    address: networks.find((network) => network.chainId === 42161)!.bridgeContract as `0x${string}`,
    abi: BridgeABI,
    eventName: "IntentCreated",
    onLogs: (logs) => {
      //console.log(logs[0].args.intent);
      if (logs[0].args.intent!.relayer === walletAddress) {
        console.log("This intent is mine:", logs[0].args.intent);
      }
    },
  });

  const optimismUnwatch = optimismPublicClient.watchContractEvent({
    address: networks.find((network) => network.chainId === 10)!.bridgeContract as `0x${string}`,
    abi: BridgeABI,
    eventName: "IntentCreated",
    onLogs: (logs) => {
      //console.log(logs[0].args.intent);
      if (logs[0].args.intent!.relayer === walletAddress) {
        console.log("This intent is mine:", logs[0].args.intent);
      }
    },
  });

  const scrollUnwatch = scrollPublicClient.watchContractEvent({
    address: networks.find((network) => network.chainId === 534352)!.bridgeContract as `0x${string}`,
    abi: BridgeABI,
    eventName: "IntentCreated",
    onLogs: (logs) => {
      //console.log(logs[0].args.intent);
      if (logs[0].args.intent!.relayer === walletAddress) {
        console.log("This intent is mine:", logs[0].args.intent);
      }
    },
  });

  //testnets
  const sepoliaUnwatch = sepoliaPublicClient.watchContractEvent({
    address: networks.find((network) => network.chainId === 11155111)!.bridgeContract as `0x${string}`,
    abi: BridgeABI,
    eventName: "IntentCreated",
    onLogs: (logs) => {
      //console.log(logs[0].args.intent);
      if (logs[0].args.intent!.relayer === walletAddress) {
        console.log("This intent is mine:", logs[0].args.intent);
      }
    },
  });
  const arbitrumSepoliaUnwatch = arbitrumSepoliaPublicClient.watchContractEvent({
    address: networks.find((network) => network.chainId === 421614)!.bridgeContract as `0x${string}`,
    abi: BridgeABI,
    eventName: "IntentCreated",
    onLogs: (logs) => {
      //console.log(logs[0].args.intent);
      if (logs[0].args.intent!.relayer === walletAddress) {
        console.log("This intent is mine:", logs[0].args.intent);
      }
    },
  });
  const optimismSepoliaUnwatch = optimismSepoliaPublicClient.watchContractEvent({
    address: networks.find((network) => network.chainId === 11155420)!.bridgeContract as `0x${string}`,
    abi: BridgeABI,
    eventName: "IntentCreated",
    onLogs: (logs) => {
      //console.log(logs[0].args.intent);
      if (logs[0].args.intent!.relayer === walletAddress) {
        console.log("This intent is mine:", logs[0].args.intent);
      }
    },
  });
  const scrollSepoliaUnwatch = scrollSepoliaPublicClient.watchContractEvent({
    address: networks.find((network) => network.chainId === 534351)!.bridgeContract as `0x${string}`,
    abi: BridgeABI,
    eventName: "IntentCreated",
    onLogs: (logs) => {
      //console.log(logs[0].args.intent);
      if (logs[0].args.intent!.relayer === walletAddress) {
        console.log("This intent is mine:", logs[0].args.intent);
      }
    },
  });
};
function handleFulfill() {
  throw new Error("Function not implemented.");
}
