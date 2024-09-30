import { io } from "socket.io-client";
import { PRIVATE_KEY, BACKEND_URL } from "../config/env";
import { privateKeyToAddress } from "viem/accounts";

import feeSchemaData from "../config/feeSchema.json";
import { FeeSchema, Intent } from "../config/types";

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

  socket.on("giveOffers", (intent: Intent, callback) => {
    console.log("Received intent:", intent);

    const targetChainId = String(intent.targetNetwork);
    const targetToken = intent.targetToken as `0x${string}`;

    const schemaForTargetChain = feeSchema[targetChainId];

    if (!schemaForTargetChain || !schemaForTargetChain[targetToken]) {
      console.error("Fee schema not found for this chain or token.");
      callback({ status: "error", walletAddress, message: "Fee schema not found." });
      return;
    }

    const { baseFee, percentageFee } = schemaForTargetChain[targetToken];

    const baseFeeValue = parseFloat(baseFee) * 10 ** 18;
    const percentageFeeValue = parseFloat(percentageFee) / 100;

    const intentAmount = parseFloat(intent.amount);
    const fee = baseFeeValue + intentAmount * percentageFeeValue;

    const targetAmount = intentAmount - fee;

    console.log(`baseFeeValue ${baseFeeValue}`);
    console.log(`percentageFeeValue ${percentageFeeValue}`);
    console.log(`intentAmount ${intentAmount}`);
    console.log(`fee ${fee}`);
    console.log(`targetAmount ${targetAmount}`);

    console.log(`Calculated targetAmount: ${targetAmount}, fee: ${fee}`);
    callback({
      status: "ok",
      walletAddress,
      targetAmount,
    });
  });

  return socket;
};

export const getWalletAddress = () => walletAddress;
