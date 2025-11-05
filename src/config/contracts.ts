import { arbitrumSepolia, sepolia } from "viem/chains";
import { Contract, Coprocessor } from "./types";
import addresses from "./addresses";

const contracts: {
  [chainId: number]: Contract;
} = {
  [sepolia.id]: {
    fhenixBridge: { address: addresses[sepolia.id].fhenixBridge, coprocessor: Coprocessor.FHENIX },
  },
  [arbitrumSepolia.id]: {
    fhenixBridge: { address: addresses[arbitrumSepolia.id].fhenixBridge, coprocessor: Coprocessor.FHENIX },
  },
};

export default contracts;
