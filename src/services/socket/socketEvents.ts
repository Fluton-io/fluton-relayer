import { Socket } from "socket.io-client";
import { FeeSchema, Intent } from "../../config/types";
import { calculateAmountWithOdos, findTokenCombinations, getOdosPrice } from "../aggregatorService";
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
  const schemaForTargetChain = feeSchema[targetChainId];

  if (!schemaForTargetChain) {
    console.error(`Chain ID ${targetChainId} not supported by the relayer.`);
    callback({ status: "error", walletAddress, message: `Chain ID ${targetChainId} not supported.` });
    return;
  }

  let targetAmount: number;

  try {
    const sourceTokenPrice = await getOdosPrice(parseInt(sourceNetwork), sourceToken);
    const sourceAmountInUSD = sourceTokenPrice * Number(amount);

    const relayerTargetToken = schemaForTargetChain[targetToken];
    const relayerTargetTokenPrice = await getOdosPrice(parseInt(targetChainId), targetToken);
    const relayerTargetTokenValue = relayerTargetTokenPrice * Number(relayerTargetToken.balance);

    if (relayerTargetToken && relayerTargetTokenValue >= Number(sourceAmountInUSD)) {
      // if relayer has enough target token, calculate the target amount
      const { baseFee, percentageFee } = relayerTargetToken;
      const targetTokenTransferAmount = sourceAmountInUSD / relayerTargetTokenPrice;
      const baseFeeValue = parseFloat(baseFee);
      const percentageFeeValue = parseFloat(percentageFee) / 100;
      const totalFee = baseFeeValue + targetTokenTransferAmount * percentageFeeValue;
      targetAmount = targetTokenTransferAmount - totalFee;
    } else {
      // if relayer doesn't have enough target token, find token combinations and calculate the target amount
      const tokenCombination = await findTokenCombinations(targetChainId, String(sourceAmountInUSD));
      console.log("Token combinations:", tokenCombination);
      targetAmount = Number(await calculateAmountWithOdos(targetChainId, intent, walletAddress, tokenCombination));
    }

    console.log(`Calculated targetAmount: ${targetAmount}`);
    callback({
      status: "ok",
      walletAddress,
      targetAmount,
    });
  } catch (error) {
    console.error("Error in giveOffers:", error);
    callback({ status: "error", walletAddress, message: "Error processing the offer" });
  }
};
