import { Socket } from "socket.io-client";
import { FeeSchema, Intent } from "../../config/types";
import { calculateAmountWithAggregator, findTokenCombinations, getPrice } from "../aggregatorService";
import testnetToMainnet from "../../config/testnetToMainnet";
import testnetToMainnetToken from "../../config/testnetToMainnetToken";

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
  const schemaForTargetChain = feeSchema.chains[targetChainId];

  if (!schemaForTargetChain) {
    console.error(`Chain ID ${targetChainId} not supported by the relayer.`);
    callback({ status: "error", walletAddress, message: `Chain ID ${targetChainId} not supported.` });
    return;
  }

  try {
    const sourceTokenPrice = (await getPrice(parseInt(sourceNetwork), sourceToken))[sourceToken];
    console.log("Source token price:", sourceTokenPrice);

    const sourceAmountInUSD = sourceTokenPrice * Number(amount);
    console.log("sourceAmountInUSD:", sourceAmountInUSD);

    console.log("schemaForTargetChain:", schemaForTargetChain);
    const relayerTargetToken = schemaForTargetChain[targetToken];
    console.log("relayer target token:", relayerTargetToken);
    const relayerTargetTokenPrice = await getPrice(parseInt(targetChainId), targetToken);
    console.log("relayer target token price:", relayerTargetTokenPrice);
    const relayerTargetTokenValue = relayerTargetTokenPrice * Number(relayerTargetToken.balance);
    console.log("relayer target token value:", relayerTargetTokenValue);
    let result;
    if (relayerTargetToken && relayerTargetTokenValue >= Number(sourceAmountInUSD)) {
      // if relayer has enough target token, calculate the target amount
      const { baseFee, percentageFee } = relayerTargetToken;
      const targetTokenTransferAmount = sourceAmountInUSD / relayerTargetTokenPrice;
      const baseFeeValue = parseFloat(baseFee);
      const percentageFeeValue = parseFloat(percentageFee) / 100;
      const totalFee = baseFeeValue + targetTokenTransferAmount * percentageFeeValue;
      const targetAmount = targetTokenTransferAmount - totalFee;

      result = { finalTargetAmount: targetAmount, pathVizImage: null };
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
      pathVizImage: result.pathVizImage,
    });
  } catch (error) {
    console.error("Error in giveOffers:", error);
    callback({ status: "error", walletAddress, message: "Error processing the offer" });
  }
};
