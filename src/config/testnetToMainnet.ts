import { arbitrum, arbitrumSepolia, mainnet, sepolia } from "viem/chains";

const testnetToMainnet: { [chainId: string]: string } = {
  [sepolia.id.toString()]: mainnet.id.toString(),
  [arbitrumSepolia.id.toString()]: arbitrum.id.toString(),
};

export default testnetToMainnet;
