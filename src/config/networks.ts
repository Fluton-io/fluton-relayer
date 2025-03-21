import { INFURA_API_KEY } from "./env";

const mainnets = [
  {
    name: "Ethereum Mainnet",
    chainId: 1,
    rpcUrl: `https://mainnet.infura.io/v3/${INFURA_API_KEY}`,
    explorer: {
      name: "Etherscan",
      apiKey: "YVGC5X6NFDNIH3C4DMX4UHYPU36XN1JGK7",
      url: "https://etherscan.io",
    },
    bridgeContract: "0x",
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
    bridgeContract: "0x",
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
    bridgeContract: "0x",
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
    bridgeContract: "0x",
  },
];

const testnets = [
  {
    name: "Ethereum Sepolia Testnet",
    chainId: 11155111,
    rpcUrl: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
    explorer: {
      name: "Etherscan Sepolia",
      apiKey: "YVGC5X6NFDNIH3C4DMX4UHYPU36XN1JGK7",
      url: "https://sepolia.etherscan.io",
    },
    bridgeContract: "0xf6a2C74547d9bBe307A7ad1D9D604976D9aE9CC8", // updated contract with bridge and bridgeWithPermit
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
    bridgeContract: "0xa0366a3e5D1f510B33C5E727FfAb3D909C8918B5", // updated contract with bridge and bridgeWithPermit
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
    bridgeContract: "0x",
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
    bridgeContract: "0x7198dc5a074ac365ccc4e43213522675957a8ab0",
  },
];

const networks = [...mainnets, ...testnets];

export default networks;
