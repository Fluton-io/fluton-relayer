import { arbitrum, arbitrumSepolia, mainnet, sepolia, holesky } from "viem/chains";

const testnetToMainnet: { [chainId: string]: string } = {
  [sepolia.id.toString()]: mainnet.id.toString(),
  [arbitrumSepolia.id.toString()]: arbitrum.id.toString(),
  [holesky.id.toString()]: mainnet.id.toString(),
};

export default testnetToMainnet;
