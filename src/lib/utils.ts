import { ethers } from "ethers";
import networks from "../config/networks";

export const getRpcUrlByChainId = (chainId: number): string => {
  const network = networks.find((network) => network.chainId === chainId);
  if (!network) {
    throw new Error(`Network with chainId ${chainId} not found`);
  }
  return network.rpcUrl;
};

export const fetchTokenDecimals = async (tokenAddress: `0x${string}`, chainId: number) => {
  try {
    const rpcUrl = getRpcUrlByChainId(chainId);
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const tokenContract = new ethers.Contract(tokenAddress, ["function decimals() view returns (uint8)"], provider);

    const decimals = await tokenContract.decimals();
    return decimals;
  } catch (error) {
    console.error(`Failed to fetch decimals for token: ${tokenAddress}`, error);
    throw new Error("Unable to fetch token decimals");
  }
};
