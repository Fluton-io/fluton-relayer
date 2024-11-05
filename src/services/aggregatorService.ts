import axios from "axios";
import { ODOS_QUOTE_URL } from "../config/env";
import { FeeSchema, Intent, TargetNetworkDetails } from "../config/types";
import feeSchemaData from "../config/feeSchema.json";
import { fetchTokenDecimals } from "../lib/utils";
import { SAFE_SWAP_RATE } from "../config/constants";
import { getCachedPrice, setCachedPrice } from "../lib/cache";
import testnetToMainnet from "../config/testnetToMainnet";
import testnetToMainnetToken from "../config/testnetToMainnetToken";

const feeSchema: FeeSchema = feeSchemaData;

// Fetch functions
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
    const response = await axios.post(`${ODOS_QUOTE_URL}/sor/quote/v2`, body);

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

export const getOdosPrice = async (chainId: number, tokenAddress: `0x${string}`) => {
  chainId = +testnetToMainnet[chainId] || chainId;
  tokenAddress = testnetToMainnetToken[tokenAddress] || tokenAddress;

  const cacheKey = `${chainId}-${tokenAddress}`;
  const cachedPrice = getCachedPrice(cacheKey);
  if (cachedPrice) {
    return cachedPrice;
  }

  try {
    console.log("sending price request for", tokenAddress, "on chain", chainId);
    const response = await axios.get(`${ODOS_QUOTE_URL}/pricing/token/${chainId}/${tokenAddress}?currencyId=USD`);
    const { price } = response.data;

    console.log("price is", price);

    if (!price) {
      throw new Error("No price returned from ODOS");
    }

    setCachedPrice(cacheKey, price);
    return price;
  } catch (error) {
    console.error("Error fetching ODOS price:", error);
    throw new Error("Failed to fetch price from ODOS");
  }
};

// Calculate functions
export const calculateAmountWithOdos = async (
  chainId: string,
  intent: Intent,
  walletAddress: `0x${string}`,
  tokenCombination: { token: `0x${string}`; amount: string }[]
) => {
  const schemaForTargetChain = feeSchema[chainId];
  const targetToken = intent.targetToken;

  // Get input tokens for the swap
  const inputTokens = getInputTokensForSwap(tokenCombination, targetToken, schemaForTargetChain);

  // Get non-swap tokens
  const nonSwapTokens = getNonSwapTokens(tokenCombination, targetToken);

  // Check if there are valid tokens
  if (inputTokens.length === 0 && nonSwapTokens.length === 0) {
    throw new Error("No valid input tokens for the swap.");
  }

  // Fetch Odos quote if there are input tokens
  const { amount: odosAmount, pathVizImage } =
    inputTokens.length > 0
      ? await getOdosQuote(parseInt(chainId), inputTokens, intent.targetToken, walletAddress)
      : { amount: 0, pathVizImage: null };

  // Fetch decimals for the target token
  const targetTokenDecimals = await fetchTokenDecimals(intent.targetToken, parseInt(chainId));

  // Calculate target amount from Odos quote
  const odosTargetAmount = parseFloat(odosAmount) / 10 ** Number(targetTokenDecimals);

  // Calculate total target amount including non-swap tokens
  const totalTargetAmount = odosTargetAmount + nonSwapTokens.reduce((acc, val) => acc + val, 0);

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
  const tokenPrices = await getTokenPricesForSchema(chainId, feeSchema);
  const eligibleTokens = tokenPrices.filter(({ valueInUSD }) => valueInUSD > 0);
  const tokenCombinations = [];

  for (const tokenData of eligibleTokens) {
    if (tokenData.valueInUSD >= Number(amount) * SAFE_SWAP_RATE) {
      return calculateSingleTokenCombination(tokenData, amount);
    }
    tokenCombinations.push({ token: tokenData.token, amount: tokenData.balance.toString() });
  }

  return findMultiTokenCombination(eligibleTokens, amount);
};

const getTokenPricesForSchema = async (chainId: string, feeSchema: FeeSchema) => {
  const schemaForTargetChain = feeSchema[chainId];
  if (!schemaForTargetChain) {
    throw new Error(`No fee schema found for chainId: ${chainId}`);
  }

  return await Promise.all(
    Object.keys(schemaForTargetChain).map(async (tokenAddress) => {
      const tokenData = schemaForTargetChain[tokenAddress as `0x${string}`];
      const tokenPriceInUSD = await getOdosPrice(parseInt(chainId), tokenAddress as `0x${string}`);
      return {
        token: tokenAddress as `0x${string}`,
        priceInUSD: tokenPriceInUSD,
        valueInUSD: tokenPriceInUSD * Number(tokenData.balance),
        balance: Number(tokenData.balance),
        decimals: tokenData.decimals,
      };
    })
  );
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
  for (const tokenData of eligibleTokens) {
    totalValue += tokenData.valueInUSD;
    if (totalValue >= Number(amount)) {
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
