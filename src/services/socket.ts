import { io } from "socket.io-client";
import { PRIVATE_KEY, BACKEND_URL } from "../config/env";
import { privateKeyToAddress } from "viem/accounts";

import feeSchemaData from "../config/feeSchema.json";
import { FeeSchema, Intent } from "../config/types";
import { calculateAmountWithOdos } from "./aggregatorQuote";

const feeSchema: FeeSchema = feeSchemaData;

const walletAddress = privateKeyToAddress(PRIVATE_KEY);

export const createSocket = () => {
  const socket = io(BACKEND_URL);

  socket.on("connect", () => {
    console.log(`Relayer connected with ID: ${socket.id}`);
  });

  socket.on("disconnect", () => {
    console.log("Relayer disconnected");
  });

  socket.on("giveOffers", async (intent: Intent, callback) => {
    console.log("Received intent:", intent);

    const targetChainId = String(intent.targetNetwork);
    const targetToken = intent.targetToken as `0x${string}`;
    const schemaForTargetChain = feeSchema[targetChainId];

    let targetAmount: number;

    // Chain is not supported by the relayer
    if (!schemaForTargetChain) {
      console.error(`Chain ID ${targetChainId} not supported by the relayer.`);
      callback({ status: "error", walletAddress, message: `Chain ID ${targetChainId} not supported.` });
      return;
    }

    // Chain is supported but the token is not found on feeSchema
    if (!schemaForTargetChain[targetToken]) {
      console.log(
        `Token ${targetToken} not found in fee schema for chain ID ${targetChainId}. Attempting ODOS quote...`
      );

      try {
        targetAmount = Number(await calculateAmountWithOdos(targetChainId, intent, walletAddress));
      } catch (error) {
        console.error("Error calculating via ODOS", error);
        callback({ status: "error", walletAddress, message: "Error calculating via ODOS" });
        return;
      }
    } else {
      // Chain and token both supported, normal fee calculation based on feeSchema

      const { baseFee, percentageFee } = schemaForTargetChain[targetToken];

      const intentAmount = Number(intent.amount);
      const baseFeeValue = parseFloat(baseFee);

      const percentageFeeValue = parseFloat(percentageFee) / 100;

      const totalFee = baseFeeValue + intentAmount * percentageFeeValue;
      targetAmount = intentAmount - totalFee;
    }

    console.log(`Calculated targetAmount: ${targetAmount}`);
    callback({
      status: "ok",
      walletAddress,
      targetAmount,
    });
  });

  return socket;
};

export const getWalletAddress = () => walletAddress;
