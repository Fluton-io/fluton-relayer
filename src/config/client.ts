import { createPublicClient, createWalletClient, http, webSocket } from "viem";
import {
  arbitrum,
  arbitrumSepolia,
  baseSepolia,
  mainnet,
  optimism,
  optimismSepolia,
  scroll,
  scrollSepolia,
  sepolia,
} from "viem/chains";
import { createInstance, FhevmInstance, FhevmInstanceConfig, SepoliaConfig } from "@zama-fhe/relayer-sdk/node";
import { fhenixNitrogen } from "./custom-chains";
import {
  PRIVATE_KEY,
  SEPOLIA_RPC_URL,
  SEPOLIA_WS_URL,
  ARBITRUM_SEPOLIA_WS_URL,
  ARBITRUM_SEPOLIA_RPC_URL,
  BASE_SEPOLIA_RPC_URL,
  BASE_SEPOLIA_WS_URL,
} from "./env";
import { cofhejs, Permit } from "cofhejs/node";
import { privateKeyToAccount } from "viem/accounts";

export const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`);

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
  transport: http(SEPOLIA_RPC_URL),
});

export const arbitrumSepoliaPublicClient = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(ARBITRUM_SEPOLIA_RPC_URL),
});

export const baseSepoliaPublicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(BASE_SEPOLIA_RPC_URL),
});

export const optimismSepoliaPublicClient = createPublicClient({
  chain: optimismSepolia,
  transport: http(),
});

export const scrollSepoliaPublicClient = createPublicClient({
  chain: scrollSepolia,
  transport: http(),
});

export const fhenixNitrogenPublicClient = createPublicClient({
  chain: fhenixNitrogen,
  transport: http(),
});

export const publicClients = [
  { client: mainnetPublicClient, chainId: 1 },
  { client: arbitrumPublicClient, chainId: 42161 },
  { client: baseSepoliaPublicClient, chainId: 84532 },
  { client: optimismPublicClient, chainId: 10 },
  { client: scrollPublicClient, chainId: 534352 },
  { client: sepoliaPublicClient, chainId: 11155111 },
  { client: arbitrumSepoliaPublicClient, chainId: 421614 },
  { client: optimismSepoliaPublicClient, chainId: 11155420 },
  { client: scrollSepoliaPublicClient, chainId: 534351 },
  { client: fhenixNitrogenPublicClient, chainId: 8008148 },
];

//wallet clients

//mainnets
export const mainnetWalletClient = createWalletClient({
  chain: mainnet,
  transport: http(),
  account,
});

export const arbitrumWalletClient = createWalletClient({
  chain: arbitrum,
  transport: http(),
  account,
});

export const optimismWalletClient = createWalletClient({
  chain: optimism,
  transport: http(),
  account,
});

export const scrollWalletClient = createWalletClient({
  chain: scroll,
  transport: http(),
  account,
});

//testnets
export const sepoliaWalletClient = createWalletClient({
  chain: sepolia,
  transport: http(SEPOLIA_RPC_URL),
  account,
});

export const arbitrumSepoliaWalletClient = createWalletClient({
  chain: arbitrumSepolia,
  transport: http(ARBITRUM_SEPOLIA_RPC_URL),
  account,
});

export const baseSepoliaWalletClient = createWalletClient({
  chain: baseSepolia,
  transport: http(BASE_SEPOLIA_RPC_URL),
  account,
});

export const optimismSepoliaWalletClient = createWalletClient({
  chain: optimismSepolia,
  transport: http(),
  account,
});

export const scrollSepoliaWalletClient = createWalletClient({
  chain: scrollSepolia,
  transport: http(),
  account,
});

export const fhenixNitrogenWalletClient = createWalletClient({
  chain: fhenixNitrogen,
  transport: http(),
  account,
});

export const walletClients = [
  { client: mainnetWalletClient, chainId: 1 },
  { client: arbitrumWalletClient, chainId: 42161 },
  { client: optimismWalletClient, chainId: 10 },
  { client: scrollWalletClient, chainId: 534352 },
  { client: sepoliaWalletClient, chainId: 11155111 },
  { client: arbitrumSepoliaWalletClient, chainId: 421614 },
  { client: baseSepoliaWalletClient, chainId: 84532 },
  { client: optimismSepoliaWalletClient, chainId: 11155420 },
  { client: scrollSepoliaWalletClient, chainId: 534351 },
  { client: fhenixNitrogenWalletClient, chainId: 8008148 },
];

// websocket clients

//testnets
export const sepoliaWsClient = createPublicClient({
  chain: sepolia,
  transport: webSocket(SEPOLIA_WS_URL),
});

export const arbitrumSepoliaWsClient = createPublicClient({
  chain: arbitrumSepolia,
  transport: webSocket(ARBITRUM_SEPOLIA_WS_URL),
});

export const baseSepoliaWsClient = createPublicClient({
  chain: baseSepolia,
  transport: webSocket(BASE_SEPOLIA_WS_URL),
});

/* export const fhenixNitrogenWsClient = createPublicClient({
  chain: fhenixNitrogen,
  transport: webSocket("wss://api.nitrogen.fhenix.zone:8548"),
}); */

export const websocketClients = [
  { client: sepoliaWsClient, chainId: 11155111 },
  { client: arbitrumSepoliaWsClient, chainId: 421614 },
  { client: baseSepoliaWsClient, chainId: 84532 },
  /* { client: fhenixNitrogenWsClient, chainId: 8008148 }, */
];

// fhevm clients

let zamaClient: FhevmInstance | null = null;

export const getZamaClient = async (): Promise<FhevmInstance> => {
  if (!zamaClient) {
    const config: FhevmInstanceConfig = {
      ...SepoliaConfig,
      network: SEPOLIA_RPC_URL,
    };
    zamaClient = await createInstance(config);
  }

  return zamaClient;
};

getZamaClient();

let fhenixPermits: { [chainId: number]: Permit } = {};
export const getFhenixPermit = async (chainId: number): Promise<Permit> => {
  if (fhenixPermits[chainId]) {
    return fhenixPermits[chainId];
  }

  const walletClientSource = walletClients.find((wc) => wc.chainId === chainId)!.client;
  const publicClientSource = publicClients.find((pc) => pc.chainId === chainId)!.client;
  const permit = await cofhejs.initializeWithViem({
    viemClient: publicClientSource,
    viemWalletClient: walletClientSource,
    environment: "TESTNET",
  });

  if (!permit || !permit.success || !permit.data) {
    throw new Error(`Failed to create Fhenix permit for chainId: ${chainId}`);
  }

  fhenixPermits[chainId] = permit.data;
  return permit.data;
};
