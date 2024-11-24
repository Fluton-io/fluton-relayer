import { createPublicClient, createWalletClient, http } from "viem";
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

//public clients

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

export const publicClients = [
  { client: mainnetPublicClient, chainId: 1 },
  { client: arbitrumPublicClient, chainId: 42161 },
  { client: optimismPublicClient, chainId: 10 },
  { client: scrollPublicClient, chainId: 534352 },
  { client: sepoliaPublicClient, chainId: 11155111 },
  { client: arbitrumSepoliaPublicClient, chainId: 421614 },
  { client: optimismSepoliaPublicClient, chainId: 11155420 },
  { client: scrollSepoliaPublicClient, chainId: 534351 },
];

//wallet clients

//mainnets
export const mainnetWalletClient = createWalletClient({
  chain: mainnet,
  transport: http(),
});

export const arbitrumWalletClient = createWalletClient({
  chain: arbitrum,
  transport: http(),
});

export const optimismWalletClient = createWalletClient({
  chain: optimism,
  transport: http(),
});

export const scrollWalletClient = createWalletClient({
  chain: scroll,
  transport: http(),
});

//testnets
export const sepoliaWalletClient = createWalletClient({
  chain: sepolia,
  transport: http(),
});

export const arbitrumSepoliaWalletClient = createWalletClient({
  chain: arbitrumSepolia,
  transport: http(),
});

export const optimismSepoliaWalletClient = createWalletClient({
  chain: optimismSepolia,
  transport: http(),
});

export const scrollSepoliaWalletClient = createWalletClient({
  chain: scrollSepolia,
  transport: http(),
});

export const walletClients = [
  { client: mainnetWalletClient, chainId: 1 },
  { client: arbitrumWalletClient, chainId: 42161 },
  { client: optimismWalletClient, chainId: 10 },
  { client: scrollWalletClient, chainId: 534352 },
  { client: sepoliaWalletClient, chainId: 11155111 },
  { client: arbitrumSepoliaWalletClient, chainId: 421614 },
  { client: optimismSepoliaWalletClient, chainId: 11155420 },
  { client: scrollSepoliaWalletClient, chainId: 534351 },
];
