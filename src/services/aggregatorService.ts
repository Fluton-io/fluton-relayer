import axios from "axios";
import { ODOS_API_URL, ONEINCH_API_KEY } from "../config/env";
import { FeeSchema, Intent, TargetNetworkDetails } from "../config/types";
import feeSchemaData from "../config/feeSchema.json";
import { fetchTokenDecimals } from "../lib/utils";
import { SAFE_SWAP_RATE } from "../config/constants";
import { getCachedPrice, setCachedPrice } from "../lib/cache";
import testnetToMainnet from "../config/testnetToMainnet";
import testnetToMainnetToken from "../config/testnetToMainnetToken";
import { getAddress } from "viem";

const feeSchema: FeeSchema = feeSchemaData;
const aggregator = feeSchema.aggregator;
// Fetch functions

export const getQuote = async (
  chainId: number,
  inputTokens: { amount: string; tokenAddress: `0x${string}` }[],
  outputToken: `0x${string}`,
  userAddr: `0x${string}`
) => {
  if (aggregator === "Odos") {
    return await getOdosQuote(chainId, inputTokens, outputToken, userAddr);
  } else if (aggregator === "1inch") {
    if (inputTokens.length > 1) {
      throw new Error("1inch only supports a single input token for swapping.");
    }
    const srcToken = inputTokens[0].tokenAddress;
    const amount = inputTokens[0].amount;
    return await get1inchQuote(chainId, srcToken, outputToken, amount);
  } else {
    throw new Error(`Unsupported aggregator: ${aggregator}`);
  }
};

export const getPrice = async (chainId: number, tokenAddresses: `0x${string}` | `0x${string}`[]) => {
  const aggregator = feeSchema.aggregator;

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
export const getOdosQuote = async (
  chainId: number,
  inputTokens: { amount: string; tokenAddress: `0x${string}` }[],
  outputToken: `0x${string}`,
  userAddr: `0x${string}`
) => {
  const body = {
    chainId,
    compact: true,
    gasPrice: 20,
    inputTokens: inputTokens,
    outputTokens: [
      {
        proportion: 1,
        tokenAddress: outputToken,
      },
    ],
    referralCode: 0,
    slippageLimitPercent: 0.3,
    sourceBlacklist: [],
    sourceWhitelist: [],
    userAddr,
    linkColors: ["#123456"],
    nodeColor: "#1BEEF1",
    nodeTextColor: "#FFFFFF",
    legendTextColor: "#000000",
    width: 1200,
    height: 800,
    pathVizImage: true,
  };

  try {
    const response = await axios.post(`${ODOS_API_URL}/sor/quote/v2`, body);

    const { outAmounts, pathVizImage } = response.data;
    if (!outAmounts || outAmounts.length === 0) {
      throw new Error("No output returned from ODOS quote");
    }

    return { pathVizImage, amount: outAmounts[0] };
  } catch (error) {
    console.error("Error fetching ODOS quote:", error);
    throw new Error("Failed to fetch quote from ODOS");
  }
};

export const getOdosPrice = async (chainId: number, tokenAddresses: `0x${string}` | `0x${string}`[]) => {
  chainId = +testnetToMainnet[chainId] || chainId;

  console.log("chainId", chainId);
  tokenAddresses = Array.isArray(tokenAddresses) ? tokenAddresses : [tokenAddresses];

  console.log("tokenAddresses", tokenAddresses);

  const cacheKeys = tokenAddresses.map((address) => `${chainId}-${address}`);
  console.log("cacheKeys", cacheKeys);

  const cachedPrices = cacheKeys.map((key) => getCachedPrice(key));
  console.log("cachedPrices", cachedPrices);

  if (cachedPrices.every((price) => price && price !== undefined)) {
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

export const get1inchQuote = async (
  chainId: number,
  srcToken: `0x${string}`,
  dstToken: `0x${string}`,
  amount: string
) => {
  const url = `https://api.1inch.dev/swap/v6.0/${chainId}/quote`;

  const config = {
    headers: {
      Authorization: `Bearer ${ONEINCH_API_KEY}`,
    },
    params: {
      src: srcToken,
      dst: dstToken,
      amount: amount,
    },
    paramsSerializer: {
      indexes: null,
    },
  };

  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const response = await axios.get(url, config);
    const { dstAmount } = response.data;
    return { amount: dstAmount, pathVizImage: null };
  } catch (error) {
    console.error("Error fetching 1inch quote:", error);
    throw new Error("Failed to fetch quote from 1inch");
  }
};

export const get1inchPrice = async (chainId: number, tokenAddresses: `0x${string}` | `0x${string}`[]) => {
  tokenAddresses = Array.isArray(tokenAddresses) ? tokenAddresses : [tokenAddresses];

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

    return Object.fromEntries(Object.keys(data).map((address) => [getAddress(address), data[address]]));
  } catch (error) {
    console.error("Error fetching 1inch price:", error);
    throw new Error("Failed to fetch price from 1inch");
  }
};

// Calculate functions
export const calculateAmountWithAggregator = async (
  chainId: string,
  intent: Intent,
  walletAddress: `0x${string}`,
  tokenCombination: { token: `0x${string}`; amount: string }[]
) => {
  const schemaForTargetChain = feeSchema.chains[chainId];
  const targetToken = intent.targetToken;

  // Get input tokens for the swap
  const inputTokens = getInputTokensForSwap(tokenCombination, targetToken, schemaForTargetChain);

  // Get non-swap tokens
  const nonSwapTokens = getNonSwapTokens(tokenCombination, targetToken);

  // Check if there are valid tokens
  if (inputTokens.length === 0 && nonSwapTokens.length === 0) {
    throw new Error("No valid input tokens for the swap.");
  }

  // Fetch quote if there are input tokens
  const quote =
    inputTokens.length > 0
      ? await getQuote(parseInt(chainId), inputTokens, intent.targetToken, walletAddress)
      : { amount: 0, pathVizImage: null };

  const { amount: quotedAmount, pathVizImage = null } = quote;

  console.log("quote is ", quote);

  // Fetch decimals for the target token
  const targetTokenDecimals = await fetchTokenDecimals(intent.targetToken, parseInt(chainId));

  // Calculate target amount from quote
  const quotedTargetAmount = parseFloat(quotedAmount) / 10 ** Number(targetTokenDecimals);

  // Calculate total target amount including non-swap tokens
  const totalTargetAmount = quotedTargetAmount + nonSwapTokens.reduce((acc, val) => acc + val, 0);

  // Calculate fees
  const feePercentage = schemaForTargetChain[tokenCombination[0].token].percentageFee;
  const fee = calculateFees(totalTargetAmount, feePercentage);

  // Calculate final target amount after fees
  const finalTargetAmount = calculateFinalAmount(totalTargetAmount, fee);

  console.log(`Calculated targetAmount: ${totalTargetAmount}, fee: ${fee}, finalTargetAmount: ${finalTargetAmount}`);

  return { finalTargetAmount, pathVizImage };
};

const getInputTokensForSwap = (
  tokenCombination: { token: `0x${string}`; amount: string }[],
  targetToken: `0x${string}`,
  schemaForTargetChain: TargetNetworkDetails
) => {
  return tokenCombination
    .filter(({ token }) => token !== targetToken)
    .map(({ token, amount }) => ({
      tokenAddress: token,
      amount: (parseFloat(amount) * 10 ** schemaForTargetChain[token].decimals).toFixed(0),
    }));
};

const getNonSwapTokens = (tokenCombination: { token: `0x${string}`; amount: string }[], targetToken: `0x${string}`) => {
  return tokenCombination.filter(({ token }) => token === targetToken).map(({ amount }) => parseFloat(amount));
};

const calculateFees = (totalAmount: number, feePercentage: string) => {
  const fee = totalAmount * (parseFloat(feePercentage) / 100);
  return fee;
};

const calculateFinalAmount = (totalAmount: number, fee: number) => {
  return (totalAmount - fee).toFixed(4);
};

// Token combination functions
export const findTokenCombinations = async (chainId: string, amount: string) => {
  const tokenPrices = await getTokenPricesForSchema(chainId);
  const eligibleTokens = tokenPrices.filter(({ valueInUSD }) => valueInUSD > 0);

  const tokenCombinations = [];

  for (const tokenData of eligibleTokens) {
    if (tokenData.valueInUSD >= Number(amount) * SAFE_SWAP_RATE) {
      return calculateSingleTokenCombination(tokenData, amount);
    }
    tokenCombinations.push({ token: tokenData.token, amount: tokenData.balance.toString() });
  }
  if (aggregator === "Odos") {
    return findMultiTokenCombination(eligibleTokens, amount);
  } else {
    throw new Error(`There is no enough tokens to cover the amount: ${amount} for 1inch`);
  }
};

const getTokenPricesForSchema = async (chainId: string) => {
  const schemaForTargetChain = feeSchema.chains[chainId];
  if (!schemaForTargetChain) {
    throw new Error(`No fee schema found for chainId: ${chainId}`);
  }

  const tokenAddresses = Object.keys(schemaForTargetChain) as `0x${string}`[];
  const tokenPrices = await getPrice(parseInt(chainId), tokenAddresses);

  console.log("token addresses here are", tokenAddresses);
  console.log("token prices here are", tokenPrices);

  return tokenAddresses.map((tokenAddress) => {
    const tokenData = schemaForTargetChain[tokenAddress];
    const tokenPriceInUSD = tokenPrices[tokenAddress];
    console.log("token data here is", tokenData);
    console.log("token price in USD here is", tokenPriceInUSD);
    return {
      token: tokenAddress,
      priceInUSD: tokenPriceInUSD,
      valueInUSD: tokenPriceInUSD * Number(tokenData.balance),
      balance: Number(tokenData.balance),
      decimals: tokenData.decimals,
    };
  });
};
const calculateSingleTokenCombination = (tokenData: any, amount: string) => {
  const requiredAmountOfToken = Math.min(Number(amount) / tokenData.priceInUSD, tokenData.balance).toFixed(
    tokenData.decimals
  );
  return [{ token: tokenData.token, amount: requiredAmountOfToken }];
};

const findMultiTokenCombination = (eligibleTokens: any[], amount: string) => {
  let totalValue = 0;
  const combination = [];
  console.log("eligible tokens are", eligibleTokens, "and amount is", amount);
  for (const tokenData of eligibleTokens) {
    totalValue += tokenData.valueInUSD;
    if (totalValue >= Number(amount)) {
      console.log("total value exceeds required amount");
      return getExactTokenCombination(eligibleTokens, amount);
    }
  }
  throw new Error("No token combinations found that meet the required value.");
};

const getExactTokenCombination = (eligibleTokens: any[], amount: string) => {
  let remainingAmount = Number(amount);
  const combination = [];

  for (const tokenData of eligibleTokens) {
    const tokenAmountInUSD = Math.min(remainingAmount, tokenData.balance * tokenData.priceInUSD);
    const tokenAmount = (tokenAmountInUSD / tokenData.priceInUSD).toFixed(tokenData.decimals);
    combination.push({ token: tokenData.token, amount: tokenAmount });
    remainingAmount -= tokenAmountInUSD;

    if (remainingAmount <= 0) break;
  }

  return combination;
};
