import { Socket } from "socket.io-client";
import { AssetPriceConfig, FeeSchema, Intent } from "../../config/types";
import { calculateAmountWithAggregator, findTokenCombinations } from "../aggregatorService";
import testnetToMainnet from "../../config/testnetToMainnet";
import testnetToMainnetToken from "../../config/testnetToMainnetToken";
import { formatUnits, isAddress } from "viem";
import { getPrice } from "../aggregator/priceUtils";
import { tokensMap } from "../../config/tokens";

// Helper to get price config for a token, defaults to DEX if not specified
const getPriceConfigForToken = (
  chainId: number,
  tokenAddress: `0x${string}`,
  mainnetChainId: number,
  mainnetTokenAddress: `0x${string}`
): AssetPriceConfig => {
  // Look up token in tokensMap by address
  const chainTokens = tokensMap[chainId];
  if (chainTokens) {
    const token = Object.values(chainTokens).find((t) => t.address.toLowerCase() === tokenAddress.toLowerCase());
    if (token?.priceConfig) {
      return token.priceConfig;
    }
  }

  // Default to DEX with mainnet chain/address for price lookup
  return {
    source: "DEX",
    chainId: mainnetChainId,
    tokenAddress: mainnetTokenAddress,
  };
};

export const handleConnect = (socket: Socket, walletAddress: `0x${string}`) => {
  console.log(`Relayer connected with ID: ${socket.id}, Wallet: ${walletAddress}`);
};

export const handleDisconnect = (socket: Socket) => {
  console.log("Relayer disconnected");
};

export const handlePing = (socket: Socket) => {
  console.log("Received ping from backend, sending pong...");
  socket.emit("pong");
};

export const handleRemoved = (socket: Socket, data: any) => {
  console.log("Received removal notification:", data.message);
  socket.disconnect();
};

export const handleGiveOffers = async (
  socket: Socket,
  intent: Intent,
  callback: any,
  walletAddress: `0x${string}`,
  feeSchema: FeeSchema
) => {
  console.log("Received intent:", intent);
  const { sourceChainId, targetChainId, sourceTokenAddress, targetTokenAddress, amount } = intent;

  const sourceChainIdMainnet = testnetToMainnet[sourceChainId] || sourceChainId;
  const targetChainIdMainnet = testnetToMainnet[targetChainId] || targetChainId;

  const sourceTokenAddressMainnet = testnetToMainnetToken[sourceTokenAddress] || sourceTokenAddress;
  const targetTokenAddressMainnet = testnetToMainnetToken[targetTokenAddress] || targetTokenAddress;

  console.log("sourceTokenAddressMainnet:", sourceTokenAddressMainnet);
  console.log("targetTokenAddressMainnet:", targetTokenAddressMainnet);

  if (!isAddress(sourceTokenAddressMainnet)) {
    console.error("Invalid source token address");
    callback({ status: "error", walletAddress, message: "Invalid source token address" });
    return;
  }

  if (!isAddress(targetTokenAddressMainnet)) {
    console.error("Invalid target token address");
    callback({ status: "error", walletAddress, message: "Invalid target token address" });
    return;
  }

  // TODO: Also check if sourceToken and targetToken are <actual> ERC-20 tokens

  const schemaForSourceChain = feeSchema.chains[sourceChainId];
  const schemaForTargetChain = feeSchema.chains[targetChainId];
  const schemaForTargetChainMainnet = feeSchema.chains[targetChainIdMainnet];

  if (!schemaForTargetChainMainnet) {
    console.error(`Chain ID ${targetChainIdMainnet} not supported by the relayer.`);
    callback({ status: "error", walletAddress, message: `Chain ID ${targetChainIdMainnet} not supported.` });
    return;
  }

  try {
    // if the intent is encrypted, evaluate it
    if (!intent.amount) {
      callback({
        status: "ok",
        walletAddress,
        baseFee: schemaForTargetChainMainnet[targetTokenAddressMainnet].baseFee,
        percentageFee: schemaForTargetChainMainnet[targetTokenAddressMainnet].percentageFee,
      });
      return;
    }

    const sourcePriceConfig = getPriceConfigForToken(
      +sourceChainId,
      sourceTokenAddress,
      +sourceChainIdMainnet,
      sourceTokenAddressMainnet
    );
    const sourcePriceKey =
      sourcePriceConfig.source === "PYTH" ? sourcePriceConfig.pythPriceId! : sourceTokenAddressMainnet;
    const sourceTokenPrice = (await getPrice([sourcePriceConfig]))[sourcePriceKey];
    console.log("Source token price:", sourceTokenPrice);

    const sourceTokenDecimals = schemaForSourceChain[sourceTokenAddress]?.decimals || 18;

    formatUnits(BigInt(amount), sourceTokenDecimals);

    const sourceAmountInUSD = sourceTokenPrice * Number(formatUnits(BigInt(amount), sourceTokenDecimals));
    console.log("sourceAmountInUSD:", sourceAmountInUSD);

    const relayerTargetTokenMainnet = schemaForTargetChainMainnet[targetTokenAddressMainnet];
    const relayerTargetToken = schemaForTargetChain[targetTokenAddress];
    const targetPriceConfig = getPriceConfigForToken(
      +targetChainId,
      targetTokenAddress,
      parseInt(targetChainIdMainnet),
      targetTokenAddressMainnet
    );
    console.log("targetPriceConfig:", targetPriceConfig);
    const targetPriceKey =
      targetPriceConfig.source === "PYTH" ? targetPriceConfig.pythPriceId! : targetTokenAddressMainnet;
    console.log("targetPriceKey:", targetPriceKey);
    const relayerTargetTokenMainnetPrice = (await getPrice([targetPriceConfig]))[targetPriceKey];
    console.log("relayer target token mainnet price:", relayerTargetTokenMainnetPrice);
    const relayerTargetTokenMainnetValue = relayerTargetTokenMainnetPrice * Number(relayerTargetToken.balance);
    console.log("relayer target token mainnet value:", relayerTargetTokenMainnetValue);
    let result;

    if (relayerTargetTokenMainnetValue >= Number(sourceAmountInUSD)) {
      // if relayer has enough target token, calculate the target amount
      // targetAmount = sourceAmountInUsd / relayerTargetTokenMainnetPrice - fee
      const { baseFee, percentageFee } = relayerTargetToken;
      const targetTokenTransferAmount = sourceAmountInUSD / relayerTargetTokenMainnetPrice;
      console.log("targetTokenTransferAmount:", targetTokenTransferAmount);
      const baseFeeValue = parseFloat(baseFee);
      const percentageFeeValue = parseFloat(percentageFee) / 100;
      const totalFee = baseFeeValue + targetTokenTransferAmount * percentageFeeValue;
      const targetAmount = Math.floor(
        (targetTokenTransferAmount - totalFee) * 10 ** (schemaForTargetChain[targetTokenAddress]?.decimals || 18)
      );

      console.log(
        "target amount: ",
        targetAmount,
        " totalFee: ",
        totalFee,
        " baseFeeValue: ",
        baseFeeValue,
        " percentageFeeValue: ",
        percentageFeeValue
      );

      result = { finalTargetAmount: targetAmount, pathViz: null };
    } else {
      // If relayer doesn't have enough target token, find token combinations and calculate the target amount
      const tokenCombination = await findTokenCombinations(targetChainIdMainnet, String(sourceAmountInUSD));
      console.log("Token combinations:", tokenCombination);
      result = await calculateAmountWithAggregator(
        targetChainIdMainnet,
        targetTokenAddressMainnet,
        walletAddress,
        tokenCombination
      );
    }

    console.log(`Calculated targetAmount: ${result.finalTargetAmount}`);
    callback({
      status: "ok",
      walletAddress,
      targetAmount: result.finalTargetAmount,
      pathViz: result.pathViz,
    });
  } catch (error) {
    console.error("Error in giveOffers:", error);
    callback({ status: "error", walletAddress, message: "Error processing the offer" });
  }
};
