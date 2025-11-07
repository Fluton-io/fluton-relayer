import { arbitrumSepolia, sepolia } from "viem/chains";
import { Coprocessor } from "./types";
import addresses from "./addresses";

const contracts: {
  [chainId: number]: Record<string, { address: `0x${string}`; coprocessor?: Coprocessor }>;
} = {
  [sepolia.id]: {
    fhenixBridge: { address: addresses[sepolia.id].fhenixBridge, coprocessor: Coprocessor.FHENIX },
    fhevmBridge: { address: addresses[sepolia.id].fhevmBridge, coprocessor: Coprocessor.ZAMA },
  },
  [arbitrumSepolia.id]: {
    fhenixBridge: { address: addresses[arbitrumSepolia.id].fhenixBridge, coprocessor: Coprocessor.FHENIX },
  },
};

export default contracts;
