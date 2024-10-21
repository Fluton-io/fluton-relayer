const mainnets = [
  {
    name: "Ethereum Mainnet",
    chainId: 1,
    rpcUrl: "https://eth.llamarpc.com",
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
    rpcUrl: "https://arbitrum.llamarpc.com",
    explorer: {
      name: "Arbiscan",
      apiKey: "6DS9FIXUN1N31GG6W7BXT3FG3846MT3I5Z",
      url: "https://arbiscan.io",
    },
    bridgeContract: "0x",
  },
];

const testnets = [
  // Ethereum Sepolia Testnet
  {
    name: "Ethereum Sepolia Testnet",
    chainId: 11155111,
    rpcUrl: "https://sepolia.infura.io/v3/eb35e5bc8c51476d98621bc4dd7b737f",
    explorer: {
      name: "Etherscan",
      apiKey: "YVGC5X6NFDNIH3C4DMX4UHYPU36XN1JGK7",
      url: "https://sepolia.etherscan.io",
    },
    bridgeContract: "0x9329a605815dddaf5a9481be69ba65193c01f6d1",
  },
];

const networks = [...mainnets, ...testnets];

export default networks;
