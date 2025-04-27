import { Chain } from "viem";

export const fhenixNitrogen = {
  id: 8008148,
  name: "Fhenix Nitrogen",
  nativeCurrency: {
    name: "FHE",
    symbol: "FHE",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://api.nitrogen.fhenix.zone"],
      webSocket: ["wss://api.nitrogen.fhenix.zone:8548"],
    },
  },
  blockExplorers: {
    default: {
      name: "Fhenix Nitrogen Explorer",
      url: "https://explorer.nitrogen.fhenix.zone",
      apiUrl: "https://api.nitrogen.fhenix.zone",
    },
  },
} satisfies Chain;
