import { Socket } from "socket.io-client";
import { FeeSchema, Intent } from "../../config/types";
import { calculateAmountWithAggregator, findTokenCombinations, getPrice } from "../aggregatorService";
import testnetToMainnet from "../../config/testnetToMainnet";
import testnetToMainnetToken from "../../config/testnetToMainnetToken";
import { isAddress } from "viem";

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
  const { targetNetwork: targetChainId, targetToken, amount, sourceNetwork, sourceToken } = intent;

  if (!isAddress(targetToken)) {
    console.error("Invalid target token address");
    callback({ status: "error", walletAddress, message: "Invalid target token address" });
    return;
  }

  if (!isAddress(sourceToken)) {
    console.error("Invalid source token address");
    callback({ status: "error", walletAddress, message: "Invalid source token address" });
    return;
  }

  // TODO: Also check if sourceToken and targetToken are actual ERC-20 tokens

  const schemaForTargetChain = feeSchema.chains[testnetToMainnet[targetChainId] || targetChainId];

  if (!schemaForTargetChain) {
    console.error(`Chain ID ${targetChainId} not supported by the relayer.`);
    callback({ status: "error", walletAddress, message: `Chain ID ${targetChainId} not supported.` });
    return;
  }

  try {
    const sourceTokenPrice = (await getPrice(parseInt(sourceNetwork), sourceToken))[
      testnetToMainnetToken[sourceToken] || sourceToken
    ];
    console.log("Source token price:", sourceTokenPrice);

    const sourceAmountInUSD = sourceTokenPrice * Number(amount);
    console.log("sourceAmountInUSD:", sourceAmountInUSD);

    console.log("schemaForTargetChain:", schemaForTargetChain);
    const relayerTargetToken = schemaForTargetChain[testnetToMainnetToken[targetToken] || targetToken];
    console.log("relayer target token:", relayerTargetToken);
    const relayerTargetTokenPrice = (await getPrice(parseInt(targetChainId), targetToken))[
      testnetToMainnetToken[targetToken] || targetToken
    ];
    console.log("relayer target token price:", relayerTargetTokenPrice);
    const relayerTargetTokenValue = relayerTargetTokenPrice * Number(relayerTargetToken.balance);
    console.log("relayer target token value:", relayerTargetTokenValue);
    let result;
    if (relayerTargetToken && relayerTargetTokenValue >= Number(sourceAmountInUSD)) {
      // if relayer has enough target token, calculate the target amount
      const { baseFee, percentageFee } = relayerTargetToken;
      const targetTokenTransferAmount = sourceAmountInUSD / relayerTargetTokenPrice;
      console.log("targetTokenTransferAmount:", targetTokenTransferAmount);
      const baseFeeValue = parseFloat(baseFee);
      const percentageFeeValue = parseFloat(percentageFee) / 100;
      const totalFee = baseFeeValue + targetTokenTransferAmount * percentageFeeValue;
      const targetAmount = targetTokenTransferAmount - totalFee;

      result = { finalTargetAmount: targetAmount, pathViz: null };
    } else {
      // If relayer doesn't have enough target token, find token combinations and calculate the target amount
      const tokenCombination = await findTokenCombinations(targetChainId, String(sourceAmountInUSD));
      console.log("Token combinations:", tokenCombination);
      const targetToken = intent.targetToken;
      result = await calculateAmountWithAggregator(targetChainId, targetToken, walletAddress, tokenCombination);
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
