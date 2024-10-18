import { FeeSchema, Intent } from "../../config/types";
import { calculateAmountWithOdos, findTokenCombinations, getOdosPrice } from "../aggregatorService";

export const handleConnect = (socket: any, walletAddress: `0x${string}`) => {
  console.log(`Relayer connected with ID: ${socket.id}, Wallet: ${walletAddress}`);
};

export const handleDisconnect = (socket: any) => {
  console.log("Relayer disconnected");
};

export const handlePing = (socket: any) => {
  console.log("Received ping from backend, sending pong...");
  socket.emit("pong");
};

export const handleRemoved = (socket: any, data: any) => {
  console.log("Received removal notification:", data.message);
  socket.disconnect();
};

export const handleGiveOffers = async (
  socket: any,
  intent: Intent,
  callback: any,
  walletAddress: `0x${string}`,
  feeSchema: FeeSchema
) => {
  const startTime = Date.now();
  console.log("Received intent:", intent);
  const targetChainId = String(intent.targetNetwork);
  const targetToken = intent.targetToken as `0x${string}`;
  const schemaForTargetChain = feeSchema[targetChainId];

  if (!schemaForTargetChain) {
    console.error(`Chain ID ${targetChainId} not supported by the relayer.`);
    callback({ status: "error", walletAddress, message: `Chain ID ${targetChainId} not supported.` });
    return;
  }

  let targetAmount: number;

  try {
    const sourceTokenPrice = await getOdosPrice(parseInt(intent.sourceNetwork), intent.sourceToken);
    const sourceAmountInUSD = sourceTokenPrice * Number(intent.amount);

    const relayerTargetToken = schemaForTargetChain[targetToken];
    const relayerTargetTokenPrice = await getOdosPrice(parseInt(intent.targetNetwork), targetToken);
    const relayerTargetTokenValue = relayerTargetTokenPrice * Number(relayerTargetToken.balance);

    if (relayerTargetToken && relayerTargetTokenValue >= Number(sourceAmountInUSD)) {
      const { baseFee, percentageFee } = relayerTargetToken;
      const targetTokenTransferAmount = sourceAmountInUSD / relayerTargetTokenPrice;
      const baseFeeValue = parseFloat(baseFee);
      const percentageFeeValue = parseFloat(percentageFee) / 100;
      const totalFee = baseFeeValue + targetTokenTransferAmount * percentageFeeValue;
      targetAmount = targetTokenTransferAmount - totalFee;
    } else {
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
