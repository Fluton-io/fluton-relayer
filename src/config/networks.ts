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
  },
];

const testnets = [
  // Ethereum Sepolia Testnet
  {
    name: "Ethereum Sepolia Testnet",
    chainId: 11155111,
    rpcUrl: "https://eth-sepolia.public.blastapi.io",
    explorer: {
      name: "Etherscan",
      apiKey: "YVGC5X6NFDNIH3C4DMX4UHYPU36XN1JGK7",
      url: "https://sepolia.etherscan.io",
    },
  },
];

const networks = [...mainnets, ...testnets];

export default networks;
