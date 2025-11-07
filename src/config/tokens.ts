import { arbitrumSepolia, sepolia } from "viem/chains";
import { Coprocessor, Token } from "./types";
import addresses from "./addresses";

export const tokensMap: {
  [chainId: number]: { [symbol: string]: Token };
} = {
  [sepolia.id]: {
    cUSDC: {
      symbol: "cUSDC",
      address: addresses[sepolia.id].cUSDC,
      chainId: sepolia.id,
      decimals: 6,
      isConfidential: true,
      underlyingTokenAddress: addresses[sepolia.id].USDC,
      coprocessor: Coprocessor.ZAMA,
    },
    eUSDC: {
      symbol: "eUSDC",
      address: addresses[sepolia.id].eUSDC,
      chainId: sepolia.id,
      decimals: 18,
      isConfidential: true,
      underlyingTokenAddress: addresses[sepolia.id].USDC,
      coprocessor: Coprocessor.FHENIX,
    },
  },
  [arbitrumSepolia.id]: {
    eUSDC: {
      symbol: "eUSDC",
      address: addresses[arbitrumSepolia.id].eUSDC,
      chainId: arbitrumSepolia.id,
      decimals: 18,
      isConfidential: true,
      underlyingTokenAddress: addresses[arbitrumSepolia.id].USDC,
      coprocessor: Coprocessor.FHENIX,
    },
  },
};

const tokens: { [chainId: number]: Token[] } = Object.entries(tokensMap).reduce(
  (acc: { [chainId: number]: Token[] }, [chainId, tokens]) => {
    acc[+chainId] = Object.values(tokens);
    return acc;
  },
  {}
);

export default tokens;
