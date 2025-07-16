import { createPublicClient, createWalletClient, http, webSocket } from "viem";
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
import { createInstance, FhevmInstance, SepoliaConfig } from "@zama-fhe/relayer-sdk";
import { fhenixNitrogen } from "./custom-chains";
import { PRIVATE_KEY, SEPOLIA_RPC_URL, SEPOLIA_WS_URL, ARBITRUM_SEPOLIA_WS_URL } from "./env";
import { cofhejs, Encryptable } from "cofhejs/dist/node";
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

export const fhenixNitrogenPublicClient = createPublicClient({
  chain: fhenixNitrogen,
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
  transport: http(),
  account,
});

export const arbitrumSepoliaWalletClient = createWalletClient({
  chain: arbitrumSepolia,
  transport: http(),
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

/* export const fhenixNitrogenWsClient = createPublicClient({
  chain: fhenixNitrogen,
  transport: webSocket("wss://api.nitrogen.fhenix.zone:8548"),
}); */

export const websocketClients = [
  { client: sepoliaWsClient, chainId: 11155111 },
  { client: arbitrumSepoliaWsClient, chainId: 421614 },
  /* { client: fhenixNitrogenWsClient, chainId: 8008148 }, */
];

// fhevm clients

let zamaClient: FhevmInstance | null = null;

export const getZamaClient = async (): Promise<FhevmInstance> => {
  if (!zamaClient) {
    zamaClient = await createInstance(SepoliaConfig);
  }

  return zamaClient;
};

getZamaClient();

// fhenix
const initializeFhenixCofhejs = async () => {
  await cofhejs.initializeWithViem({
    viemClient: arbitrumSepoliaWalletClient,
    viemWalletClient: arbitrumSepoliaWalletClient,
    environment: "TESTNET",
  });
};

initializeFhenixCofhejs().catch((error) => {
  console.error("Error initializing Fhenix Cofhejs:", error);
});
