import networks from "../config/networks";
import { publicClients } from "../config/client";
import { erc20Abi } from "viem";
import { FeeSchema } from "../config/types";
import feeSchemaData from "../config/feeSchema.json";

export const getRpcUrlByChainId = (chainId: number): string => {
  const network = networks.find((network) => network.chainId === chainId);
  if (!network) {
    throw new Error(`Network with chainId ${chainId} not found`);
  }
  return network.rpcUrl;
};

export const fetchTokenDecimals = async (tokenAddress: `0x${string}`, chainId: number) => {
  try {
    const publicClient = publicClients.find((client) => client.chainId === chainId);

    if (!publicClient) {
      throw new Error(`Public client not found for chainId: ${chainId}`);
    }

    const decimals = await publicClient.client.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "decimals",
    });

    return decimals;
  } catch (error) {
    console.error(`Failed to fetch decimals for token: ${tokenAddress}`, error);
    throw new Error("Unable to fetch token decimals");
  }
};

export const fetchTokenSymbol = async (tokenAddress: `0x${string}`, chainId: number) => {
  try {
    const publicClient = publicClients.find((client) => client.chainId === chainId);

    if (!publicClient) {
      throw new Error(`Public client not found for chainId: ${chainId}`);
    }

    const symbol = await publicClient.client.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "symbol",
    });

    return symbol;
  } catch (error) {
    console.error(`Failed to fetch symbol for token: ${tokenAddress}`, error);
    throw new Error("Unable to fetch token symbol");
  }
};

export const feeSchema: FeeSchema = feeSchemaData;
export const aggregator = feeSchema.aggregator;
