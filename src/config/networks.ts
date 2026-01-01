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
import addresses from "./addresses";
import { INFURA_API_KEY } from "./env";
import { Coprocessor, Network } from "./types";
import contracts from "./contracts";
import tokens from "./tokens";

const mainnets: Network[] = [
  {
    name: "Ethereum Mainnet",
    chainId: 1,
    rpcUrl: `https://mainnet.infura.io/v3/${INFURA_API_KEY}`,
    explorer: {
      name: "Etherscan",
      apiKey: "YVGC5X6NFDNIH3C4DMX4UHYPU36XN1JGK7",
      url: "https://etherscan.io",
    },
    contracts: contracts[mainnet.id],
    tokens: tokens[mainnet.id],
  },
  {
    name: "Arbitrum Mainnet",
    chainId: 42161,
    rpcUrl: `https://arbitrum-mainnet.infura.io/v3/${INFURA_API_KEY}`,
    explorer: {
      name: "Arbiscan",
      apiKey: "6DS9FIXUN1N31GG6W7BXT3FG3846MT3I5Z",
      url: "https://arbiscan.io",
    },
    contracts: contracts[arbitrum.id],
    tokens: tokens[arbitrum.id],
  },
  {
    name: "Optimism Mainnet",
    chainId: 10,
    rpcUrl: `https://optimism-mainnet.infura.io/v3/${INFURA_API_KEY}`,
    explorer: {
      name: "Optimistic Etherscan",
      apiKey: "AYQ168A34SPAA86J41QBBUGKN933TT498E",
      url: "https://optimistic.etherscan.io",
    },
    contracts: contracts[optimism.id],
    tokens: tokens[optimism.id],
  },
  {
    name: "Scroll Mainnet",
    chainId: 534352,
    rpcUrl: `https://scroll-mainnet.infura.io/v3/${INFURA_API_KEY}`,
    explorer: {
      name: "Scrollscan",
      apiKey: "7QWQVIXUFMZJP2R2R3YNZGJ8CYZHZ4QQZN",
      url: "https://optimistic.etherscan.io",
    },
    contracts: contracts[scroll.id],
    tokens: tokens[scroll.id],
  },
];

const testnets: Network[] = [
  {
    name: "Ethereum Sepolia Testnet",
    chainId: 11155111,
    rpcUrl: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
    wsUrl: `wss://sepolia.infura.io/ws/v3/${INFURA_API_KEY}`,
    explorer: {
      name: "Etherscan Sepolia",
      apiKey: "YVGC5X6NFDNIH3C4DMX4UHYPU36XN1JGK7",
      url: "https://sepolia.etherscan.io",
    },
    contracts: contracts[sepolia.id],
    tokens: tokens[sepolia.id],
    coprocessors: [Coprocessor.FHENIX, Coprocessor.ZAMA],
  },
  {
    name: "Arbitrum Sepolia Testnet",
    chainId: 421614,
    rpcUrl: `https://arbitrum-sepolia.infura.io/v3/${INFURA_API_KEY}`,
    explorer: {
      name: "Arbiscan Sepolia",
      apiKey: "6DS9FIXUN1N31GG6W7BXT3FG3846MT3I5Z",
      url: "https://sepolia.arbiscan.io",
    },
    contracts: contracts[arbitrumSepolia.id],
    tokens: tokens[arbitrumSepolia.id],
    coprocessors: [Coprocessor.FHENIX],
  },
  {
    name: "Base Sepolia Testnet",
    chainId: 84532,
    rpcUrl: `https://arbitrum-sepolia.infura.io/v3/${INFURA_API_KEY}`,
    explorer: {
      name: "Base Sepolia",
      apiKey: "6DS9FIXUN1N31GG6W7BXT3FG3846MT3I5Z",
      url: "https://sepolia.arbiscan.io",
    },
    contracts: contracts[baseSepolia.id],
    tokens: tokens[baseSepolia.id],
    coprocessors: [Coprocessor.FHENIX],
  },
  {
    name: "Optimism Sepolia Testnet",
    chainId: 11155420,
    rpcUrl: `https://optimism-sepolia.infura.io/v3/${INFURA_API_KEY}`,
    explorer: {
      name: "Optimistic Etherscan Sepolia",
      apiKey: "AYQ168A34SPAA86J41QBBUGKN933TT498E",
      url: "https://sepolia-optimism.etherscan.io",
    },
    contracts: contracts[optimismSepolia.id],
    tokens: tokens[optimismSepolia.id],
  },
  {
    name: "Scroll Sepolia Testnet",
    chainId: 534351,
    rpcUrl: `https://scroll-sepolia.infura.io/v3/${INFURA_API_KEY}`,
    explorer: {
      name: "Scrollscan Sepolia",
      apiKey: "7QWQVIXUFMZJP2R2R3YNZGJ8CYZHZ4QQZN",
      url: "https://sepolia.scrollscan.com",
    },
    contracts: contracts[scrollSepolia.id],
    tokens: tokens[scrollSepolia.id],
  },
  /*   {
    name: "Fhenix Nitrogen Testnet",
    chainId: 8008148,
    rpcUrl: `https://api.nitrogen.fhenix.zone`,
    explorer: {
      name: "Fhenix Nitrogen",
      apiKey: null,
      url: "https://explorer.nitrogen.fhenix.zone",
    },
    contracts: {
      bridgeContract: {
        address: "0x7198dc5a074ac365ccc4e43213522675957a8ab0",
      },
      fheBridgeContract: {
        address: "0x353EA08f9cEB8b23A3496e6A24C019Ebb091AcA6",
      },
    },
  }, */
];

const networks = [...mainnets, ...testnets];

export default networks;
