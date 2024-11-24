import axios from "axios";
import { ODOS_API_URL, ONEINCH_API_KEY } from "../../config/env";
import { aggregator } from "../../lib/utils";

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
    disableRFQs: false,
    likeAsset: true,
    gasPrice: 20,
    inputTokens,
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
    pathViz: true,
  };

  try {
    const response = await axios.post(`${ODOS_API_URL}/sor/quote/v2`, body);

    console.log("odos response", response.data);
    const { outAmounts, pathViz } = response.data;
    if (!outAmounts || outAmounts.length === 0) {
      throw new Error("No output returned from ODOS quote");
    }

    return { pathViz, amount: outAmounts[0] };
  } catch (error) {
    console.error("Error fetching ODOS quote:", error);
    throw new Error("Failed to fetch quote from ODOS");
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
    return { amount: dstAmount, pathViz: null };
  } catch (error) {
    console.error("Error fetching 1inch quote:", error);
    throw new Error("Failed to fetch quote from 1inch");
  }
};
