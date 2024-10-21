import { createPublicClient, http } from "viem";
import {
  arbitrum,
  arbitrumSepolia,
  mainnet,
  optimism,
  optimismSepolia,
  scroll,
  scrollSepolia,
  sepolia,
} from "viem/chains";

//mainnets
export const mainnetPublicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

export const arbitrumPublicClient = createPublicClient({
  chain: arbitrum,
  transport: http(),
});

export const optimismPublicClient = createPublicClient({
  chain: optimism,
  transport: http(),
});

export const scrollPublicClient = createPublicClient({
  chain: scroll,
  transport: http(),
});

//testnets
export const sepoliaPublicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
});

export const arbitrumSepoliaPublicClient = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(),
});

export const optimismSepoliaPublicClient = createPublicClient({
  chain: optimismSepolia,
  transport: http(),
});

export const scrollSepoliaPublicClient = createPublicClient({
  chain: scrollSepolia,
  transport: http(),
});
