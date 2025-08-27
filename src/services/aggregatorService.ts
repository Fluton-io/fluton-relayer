import { TargetNetworkDetails } from "../config/types";
import { aggregator, feeSchema, fetchTokenDecimals } from "../lib/utils";
import { SAFE_SWAP_RATE } from "../config/constants";
import { getPrice } from "./aggregator/priceUtils";
import { getQuote } from "./aggregator/quoteUtils";

// Fetch functions

// Calculate functions
export const calculateAmountWithAggregator = async (
  chainId: string,
  targetToken: `0x${string}`,
  walletAddress: `0x${string}`,
  tokenCombination: { token: `0x${string}`; amount: string }[]
) => {
  const schemaForTargetChain = feeSchema.chains[chainId];

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
      ? await getQuote(parseInt(chainId), inputTokens, targetToken, walletAddress)
      : { amount: 0, pathViz: null };

  const { amount: quotedAmount, pathViz = null } = quote;

  console.log("quote is ", quote);

  // Fetch decimals for the target token
  const targetTokenDecimals = await fetchTokenDecimals(targetToken, parseInt(chainId));

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

  return { finalTargetAmount, pathViz };
};

/**
 * Filters the token combination to get the input tokens for the swap, excluding the target token.
 *
 * This function takes a list of tokens (with amounts) that are available for swapping and filters out the target token,
 * as it is already intended to be the output. The function also converts the amount of each input token to a value that
 * represents its smallest unit (based on its decimals) to ensure accuracy during the swap process.
 *
 * @param tokenCombination Array of token objects, each containing a token address and amount.
 * @param targetToken The token address that is the target of the swap.
 * @param schemaForTargetChain Object containing details about each token for the given target chain.
 *
 * @return Array of input tokens for the swap, including their token addresses and adjusted amounts based on decimals.
 */
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

/**
 * Filters the token combination to get the non-swap tokens, specifically targeting the target token.
 *
 * This function identifies any tokens in the given combination that match the target token address. These tokens
 * are excluded from the swap process because they are already the intended output. The amounts of these tokens are
 * returned in a simplified form to be included directly in the final calculated output amount.
 * @param tokenCombination Array of token objects, each containing a token address and amount.
 * @param targetToken The token address that is the target of the swap.
 * @return Array of amounts for the non-swap tokens, parsed as float values.
 */

const getNonSwapTokens = (tokenCombination: { token: `0x${string}`; amount: string }[], targetToken: `0x${string}`) => {
  return tokenCombination.filter(({ token }) => token === targetToken).map(({ amount }) => parseFloat(amount));
};

const calculateFees = (totalAmount: number, feePercentage: string) => {
  const fee = totalAmount * (parseFloat(feePercentage) / 100);
  return fee;
};

const calculateFinalAmount = (totalAmount: number, fee: number) => {
  return +(totalAmount - fee).toFixed(4);
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
