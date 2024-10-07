import axios from "axios";
import { ODOS_QUOTE_URL } from "../config/env";
import { FeeSchema, Intent } from "../config/types";
import feeSchemaData from "../config/feeSchema.json";
import { fetchTokenDecimals } from "../lib/utils";

const feeSchema: FeeSchema = feeSchemaData;

export const getOdosQuote = async (
  chainId: number,
  amount: string,
  inputToken: `0x${string}`,
  outputToken: `0x${string}`,
  userAddr: `0x${string}`
) => {
  const body = {
    chainId,
    compact: true,
    gasPrice: 20,
    inputTokens: [
      {
        amount,
        tokenAddress: inputToken,
      },
    ],
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
  };

  try {
    const response = await axios.post(`${ODOS_QUOTE_URL}/sor/quote/v2`, body);

    const { outAmounts } = response.data;
    if (!outAmounts || outAmounts.length === 0) {
      throw new Error("No output returned from ODOS quote");
    }
    return outAmounts[0];
  } catch (error) {
    console.error("Error fetching ODOS quote:", error);
    throw new Error("Failed to fetch quote from ODOS");
  }
};

export const calculateAmountWithOdos = async (chainId: string, intent: Intent, walletAddress: `0x${string}`) => {
  const schemaForTargetChain = feeSchema[chainId];

  const swappableToken = Object.keys(schemaForTargetChain).find(
    (token) => schemaForTargetChain[token as `0x${string}`].swappable === true
  ) as `0x${string}`;

  if (!swappableToken) {
    throw new Error("No swappable token found for this chain.");
  }

  const { decimals: swappableTokenDecimals, percentageFee } = schemaForTargetChain[swappableToken];

  const targetTokenDecimals = Number(await fetchTokenDecimals(intent.targetToken, parseInt(chainId)));

  const adjustedAmount = (parseFloat(intent.amount) * 10 ** swappableTokenDecimals).toFixed(0);

  const odosAmount = await getOdosQuote(
    parseInt(chainId),
    adjustedAmount,
    swappableToken,
    intent.targetToken,
    walletAddress
  );

  const targetAmount = parseFloat(odosAmount) / 10 ** targetTokenDecimals;

  const feePercentage = parseFloat(percentageFee) / 100;
  const fee = targetAmount * feePercentage;

  const finalTargetAmount = (targetAmount - fee).toFixed(4);

  console.log(`Calculated targetAmount: ${targetAmount}, fee: ${fee}, finalTargetAmount: ${finalTargetAmount}`);

  return finalTargetAmount;
};
