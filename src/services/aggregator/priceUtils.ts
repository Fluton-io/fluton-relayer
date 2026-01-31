import { getCachedPrice, setCachedPrice } from "../../lib/cache";
import { ODOS_API_URL, ONEINCH_API_KEY } from "../../config/env";
import axios from "axios";
import { getAddress } from "viem";
import { aggregator } from "../../lib/utils";
import { AssetPriceConfig } from "../../config/types";

export const getPrice = async (assets: AssetPriceConfig[]) => {
  const dexAssets = assets.filter((a) => a.source === "DEX");
  const pythAssets = assets.filter((a) => a.source === "PYTH");

  const results: Record<string, number> = {};

  if (dexAssets.length > 0) {
    const chainId = dexAssets[0].chainId!;
    const tokenAddresses = dexAssets.map((a) => a.tokenAddress!);

    let dexPrices: Record<string, number>;

    if (aggregator === "Odos") {
      dexPrices = await getOdosPrice(chainId, tokenAddresses);
    } else if (aggregator === "1inch") {
      dexPrices = await get1inchPrice(chainId, tokenAddresses);
    } else {
      throw new Error(`Unsupported aggregator: ${aggregator}`);
    }

    Object.assign(results, dexPrices);
  }

  if (pythAssets.length > 0) {
    const priceIds = pythAssets.map((a) => a.pythPriceId!);
    const pythPrices = await getPythHermesPrice(priceIds);

    Object.assign(results, pythPrices);
  }

  return results;
};

// ODOS
export const getOdosPrice = async (chainId: number, tokenAddresses: `0x${string}`[]) => {
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
export const get1inchPrice = async (chainId: number, tokenAddresses: `0x${string}`[]) => {
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

export const getPythHermesPrice = async (priceIds: string[]) => {
  // 1️⃣ Check cache first
  const cacheKeys = priceIds.map((id) => `hermes-${id}`);
  const cachedPrices = cacheKeys.map((key) => getCachedPrice(key));

  if (cachedPrices.every((p) => p !== null)) {
    return Object.fromEntries(priceIds.map((id, i) => [id, cachedPrices[i]!]));
  }

  try {
    const query = priceIds.map((id) => `ids[]=${id}`).join("&");
    const url = `https://hermes.pyth.network/v2/updates/price/latest?${query}`;

    const response = await axios.get(url, {
      headers: { accept: "application/json" },
    });

    const { parsed } = response.data;

    const prices: Record<string, number> = {};

    for (const item of parsed) {
      const id = item.id as string;
      const price = Number(item.price.price);
      const expo = Number(item.price.expo);

      const usdPrice = price * Math.pow(10, expo);

      prices[id] = usdPrice;
      setCachedPrice(`hermes-${id}`, usdPrice);
    }

    return prices;
  } catch (error) {
    console.error("Error fetching Hermes price:", error);
    throw new Error("Failed to fetch price from Hermes");
  }
};
