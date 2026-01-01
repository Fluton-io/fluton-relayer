import { arbitrum, arbitrumSepolia, base, baseSepolia, mainnet, sepolia } from "viem/chains";
import addresses from "./addresses";

const testnetToMainnetToken: { [key: `0x${string}`]: `0x${string}` } = {
  // sepolia -> mainnet
  [addresses[sepolia.id].WETH]: addresses[mainnet.id].WETH,

  [addresses[sepolia.id].USDC]: addresses[mainnet.id].USDC,
  [addresses[sepolia.id].cUSDC]: addresses[mainnet.id].USDC,
  [addresses[sepolia.id].eUSDC]: addresses[mainnet.id].USDC,

  [addresses[sepolia.id].USDT]: addresses[mainnet.id].USDT,
  [addresses[sepolia.id].cUSDT]: addresses[mainnet.id].USDT,
  [addresses[sepolia.id].eUSDT]: addresses[mainnet.id].USDT,

  [addresses[sepolia.id].DAI]: addresses[mainnet.id].DAI,
  [addresses[sepolia.id].cDAI]: addresses[mainnet.id].DAI,
  [addresses[sepolia.id].eDAI]: addresses[mainnet.id].DAI,

  [addresses[sepolia.id].UNI]: addresses[mainnet.id].UNI,
  [addresses[sepolia.id].cUNI]: addresses[mainnet.id].UNI,
  [addresses[sepolia.id].eUNI]: addresses[mainnet.id].UNI,

  [addresses[sepolia.id].U]: addresses[mainnet.id].U,
  [addresses[sepolia.id].cU]: addresses[mainnet.id].U,
  [addresses[sepolia.id].eU]: addresses[mainnet.id].U,

  [addresses[sepolia.id].XFL]: addresses[mainnet.id].XFL,
  [addresses[sepolia.id].cXFL]: addresses[mainnet.id].XFL,
  [addresses[sepolia.id].eXFL]: addresses[mainnet.id].XFL,

  [addresses[sepolia.id].AAVE]: addresses[mainnet.id].AAVE,
  [addresses[sepolia.id].cAAVE]: addresses[mainnet.id].AAVE,
  [addresses[sepolia.id].eAAVE]: addresses[mainnet.id].AAVE,

  // arbitrum sepolia -> arbitrum mainnet
  [addresses[arbitrumSepolia.id].WETH]: addresses[arbitrum.id].WETH,

  [addresses[arbitrumSepolia.id].USDC]: addresses[arbitrum.id].USDC,
  [addresses[arbitrumSepolia.id].eUSDC]: addresses[arbitrum.id].USDC,

  [addresses[arbitrumSepolia.id].USDT]: addresses[arbitrum.id].USDT,
  [addresses[arbitrumSepolia.id].eUSDT]: addresses[arbitrum.id].USDT,

  [addresses[arbitrumSepolia.id].DAI]: addresses[arbitrum.id].DAI,
  [addresses[arbitrumSepolia.id].eDAI]: addresses[arbitrum.id].DAI,

  [addresses[arbitrumSepolia.id].UNI]: addresses[arbitrum.id].UNI,
  [addresses[arbitrumSepolia.id].eUNI]: addresses[arbitrum.id].UNI,

  [addresses[arbitrumSepolia.id].XFL]: addresses[arbitrum.id].XFL,
  [addresses[arbitrumSepolia.id].eXFL]: addresses[arbitrum.id].XFL,

  [addresses[arbitrumSepolia.id].AAVE]: addresses[arbitrum.id].AAVE,
  [addresses[arbitrumSepolia.id].eAAVE]: addresses[arbitrum.id].AAVE,

  // base sepolia -> base mainnet
  [addresses[baseSepolia.id].WETH]: addresses[base.id].WETH,

  [addresses[baseSepolia.id].USDC]: addresses[base.id].USDC,
  [addresses[baseSepolia.id].eUSDC]: addresses[base.id].USDC,

  [addresses[baseSepolia.id].USDT]: addresses[base.id].USDT,
  [addresses[baseSepolia.id].eUSDT]: addresses[base.id].USDT,

  [addresses[baseSepolia.id].DAI]: addresses[base.id].DAI,
  [addresses[baseSepolia.id].eDAI]: addresses[base.id].DAI,

  [addresses[baseSepolia.id].UNI]: addresses[base.id].UNI,
  [addresses[baseSepolia.id].eUNI]: addresses[base.id].UNI,

  [addresses[baseSepolia.id].XFL]: addresses[base.id].XFL,
  [addresses[baseSepolia.id].eXFL]: addresses[base.id].XFL,

  [addresses[baseSepolia.id].AAVE]: addresses[base.id].AAVE,
  [addresses[baseSepolia.id].eAAVE]: addresses[base.id].AAVE,
};

export default testnetToMainnetToken;
