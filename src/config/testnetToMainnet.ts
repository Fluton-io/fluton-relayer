import { arbitrum, arbitrumSepolia, mainnet, sepolia } from "viem/chains";
import { fhenixNitrogen } from "./custom-chains";

const testnetToMainnet: { [chainId: string]: string } = {
  [sepolia.id.toString()]: mainnet.id.toString(),
  [arbitrumSepolia.id.toString()]: arbitrum.id.toString(),
  [fhenixNitrogen.id]: mainnet.id.toString(), // fhenix nitrogen testnet -> mainnet
};

export default testnetToMainnet;
