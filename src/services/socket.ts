import { io } from "socket.io-client";
import { PRIVATE_KEY, BACKEND_URL } from "../config/env";
import { privateKeyToAddress } from "viem/accounts";

const walletAddress = privateKeyToAddress(PRIVATE_KEY);

export const createSocket = () => {
  const socket = io(BACKEND_URL);

  socket.on("connect", () => {
    console.log(`Relayer connected with ID: ${socket.id}`);
  });

  socket.on("disconnect", () => {
    console.log("Relayer disconnected");
  });

  socket.on("giveOffers", (intent, callback) => {
    console.log("Received intent:", intent);

    const fee = Math.floor(Math.random() * 10) + 1;
    const price = 1.01;
    const targetAmount = price * Number(intent.amount) - fee;

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
