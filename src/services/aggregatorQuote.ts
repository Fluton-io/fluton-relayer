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

    console.log("Response from ODOS:", response.data);
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
  console.log("Received intent:", intent);

  const sourceTokenDecimals = await fetchTokenDecimals(intent.sourceToken, parseInt(chainId));
  const targetTokenDecimals = await fetchTokenDecimals(intent.targetToken, parseInt(chainId));

  const amountBigInt = BigInt(parseFloat(intent.amount) * 10 ** Number(sourceTokenDecimals)).toString();

  const adjustedAmount = amountBigInt.toString();

  console.log(
    "parameters parseInt(chainId), adjustedAmount, intent.sourceToken, intent.targetToken, walletAddress",
    parseInt(chainId),
    adjustedAmount,
    intent.sourceToken,
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    walletAddress
  );
  const sourceTokenDollarValue = await getOdosQuote(
    parseInt(chainId),
    adjustedAmount,
    intent.sourceToken,
    "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    walletAddress
  );

  console.log(`Source token dollar value is ${sourceTokenDollarValue}`);

  const matchingToken = Object.keys(feeSchema[chainId]).find((token) => {
    const tokenInfo = feeSchema[chainId][token as `0x${string}`];
    return tokenInfo.balance >= parseFloat(sourceTokenDollarValue) && tokenInfo.swappable === false;
  });

  if (matchingToken) {
    console.log(` matching token feeSchema: ${matchingToken}`);
    return matchingToken;
  }

  console.log("No direct matching token found, checking swappable tokens");

  const bestToken = await findBestSwappableTokenPair(chainId, sourceTokenDollarValue, intent, walletAddress);

  console.log(`Best swappable token pair is ${bestToken}`);

  return bestToken;
};

export const findBestSwappableTokenPair = async (
  chainId: string,
  sourceTokenDollarValue: string,
  intent: Intent,
  walletAddress: `0x${string}`
) => {
  const schemaForTargetChain = feeSchema[chainId];

  const tokenPairs = await Promise.all(
    Object.keys(schemaForTargetChain).map(async (token) => {
      const { balance, swappable } = schemaForTargetChain[token as `0x${string}`];
      if (swappable) {
        console.log(`Checking swappable token: ${token}`);
        try {
          console.log(
            "parameters2 parseInt(chainId), sourceTokenDollarValue, token, intent.targetToken, walletAddress",
            parseInt(chainId),
            sourceTokenDollarValue,
            token,
            intent.targetToken,
            walletAddress
          );
          const odosQuote = await getOdosQuote(
            parseInt(chainId),
            (parseFloat(sourceTokenDollarValue) * 10 ** 18).toFixed(0),
            token as `0x${string}`,
            intent.targetToken,
            walletAddress
          );
          console.log(`ODOS quote for token ${token}: ${odosQuote}`);
          return { token, odosQuote };
        } catch (error) {
          console.error(`Failed to get ODOS quote for token ${token}`, error);
          return null;
        }
      }
      return null;
    })
  );

  const validTokenPairs = tokenPairs.filter((pair) => pair !== null) as {
    token: `0x${string}`;
    odosQuote: string;
  }[];

  if (validTokenPairs.length === 0) {
    throw new Error("No valid swappable token pairs found for ODOS.");
  }

  const bestTokenPair = validTokenPairs.reduce((prev, current) => {
    return parseFloat(current.odosQuote) > parseFloat(prev.odosQuote) ? current : prev;
  });

  console.log(`Best token pair selected: ${bestTokenPair.token}, ODOS quote: ${bestTokenPair.odosQuote}`);
  return bestTokenPair.token;
};
