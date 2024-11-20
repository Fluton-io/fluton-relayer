import { getCachedPrice, setCachedPrice } from "../../lib/cache";
import { ODOS_API_URL, ONEINCH_API_KEY } from "../../config/env";
import axios from "axios";
import { getAddress } from "viem";
import { aggregator } from "../../lib/utils";

export const getPrice = async (chainId: number, tokenAddresses: `0x${string}` | `0x${string}`[]) => {
  console.log("aggregator", aggregator);
  if (aggregator === "Odos") {
    return await getOdosPrice(chainId, tokenAddresses);
  } else if (aggregator === "1inch") {
    return await get1inchPrice(chainId, tokenAddresses);
  } else {
    throw new Error(`Unsupported aggregator: ${aggregator}`);
  }
};

// ODOS
export const getOdosPrice = async (chainId: number, tokenAddresses: `0x${string}` | `0x${string}`[]) => {
  tokenAddresses = Array.isArray(tokenAddresses) ? tokenAddresses : [tokenAddresses];
  console.log("tokenAddresses", tokenAddresses);

  const cacheKeys = tokenAddresses.map((address) => `${chainId}-${address}`);
  console.log("cacheKeys", cacheKeys);

  const cachedPrices = cacheKeys.map((key) => getCachedPrice(key));
  console.log("cachedPrices", cachedPrices);

  if (cachedPrices.every((price) => price !== null)) {
    console.log(
      "using cached prices with",
      Object.fromEntries(tokenAddresses.map((address, index) => [address, cachedPrices[index]]))
    );
    return Object.fromEntries(tokenAddresses.map((address, index) => [address, cachedPrices[index]]));
  }

  try {
    console.log("sending price request for", tokenAddresses, "on chain", chainId);

    const response = await axios.get(
      `${ODOS_API_URL}/pricing/token/${chainId}?${tokenAddresses
        .map((address) => `token_addresses=${address}`)
        .join("&")}&currencyId=USD`
    );
    const { tokenPrices } = response.data;

    tokenAddresses.forEach((address) => {
      setCachedPrice(`${chainId}-${address}`, tokenPrices[address]);
    });

    console.log("tokenPrices", tokenPrices);
    return tokenPrices;
  } catch (error) {
    console.error("Error fetching ODOS price:", error);
    throw new Error("Failed to fetch price from ODOS");
  }
};

// 1inch
export const get1inchPrice = async (chainId: number, tokenAddresses: `0x${string}` | `0x${string}`[]) => {
  tokenAddresses = Array.isArray(tokenAddresses) ? tokenAddresses : [tokenAddresses];

  const cacheKeys = tokenAddresses.map((address) => `${chainId}-${address}`);
  console.log("cacheKeys", cacheKeys);

  const cachedPrices = cacheKeys.map((key) => getCachedPrice(key));
  console.log("cachedPrices", cachedPrices);

  if (cachedPrices.every((price) => price !== null)) {
    console.log(
      "using cached prices with",
      Object.fromEntries(tokenAddresses.map((address, index) => [getAddress(address), cachedPrices[index]]))
    );
    return Object.fromEntries(tokenAddresses.map((address, index) => [getAddress(address), cachedPrices[index]]));
  }

  const url = `https://api.1inch.dev/price/v1.1/${chainId}`;
  const config = {
    headers: {
      Authorization: `Bearer ${ONEINCH_API_KEY}`,
    },
    params: {},
    paramsSerializer: {
      indexes: null,
    },
  };

  const body = {
    tokens: tokenAddresses,
    currency: "USD",
  };

  try {
    console.log("sending price request for 1inch");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const response = await axios.post(url, body, config);
    const { data } = response;

    tokenAddresses.forEach((address) => {
      setCachedPrice(`${chainId}-${address}`, data[getAddress(address)]);
    });

    return Object.fromEntries(Object.keys(data).map((address) => [getAddress(address), data[address]]));
  } catch (error) {
    console.error("Error fetching 1inch price:", error);
    throw new Error("Failed to fetch price from 1inch");
  }
};
