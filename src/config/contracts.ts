import { arbitrumSepolia, baseSepolia, sepolia } from "viem/chains";
import { Coprocessor } from "./types";
import addresses from "./addresses";

const contracts: {
  [chainId: number]: Record<string, { address: `0x${string}`; coprocessor?: Coprocessor }>;
} = {
  [sepolia.id]: {
    cofheBridge: { address: addresses[sepolia.id].cofheBridge, coprocessor: Coprocessor.FHENIX },
    fhevmBridge: { address: addresses[sepolia.id].fhevmBridge, coprocessor: Coprocessor.ZAMA },
  },
  [arbitrumSepolia.id]: {
    cofheBridge: { address: addresses[arbitrumSepolia.id].cofheBridge, coprocessor: Coprocessor.FHENIX },
  },
  [baseSepolia.id]: {
    cofheBridge: { address: addresses[baseSepolia.id].cofheBridge, coprocessor: Coprocessor.FHENIX },
  },
};

export default contracts;
