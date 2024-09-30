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
