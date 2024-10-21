import { createPublicClient, http } from "viem";
import { mainnet, sepolia } from "viem/chains";

export const mainnetPublicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

export const sepoliaPublicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
});
