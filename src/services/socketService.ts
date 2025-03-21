import { io } from "socket.io-client";
import { BACKEND_URL, walletAddress } from "../config/env";
import { FeeSchema } from "../config/types";
import feeSchemaData from "../config/feeSchema.json";
import { handleConnect, handleDisconnect, handlePing, handleRemoved, handleGiveOffers, handleExecuteTransaction } from "./socket/socketEvents";

const feeSchema: FeeSchema = feeSchemaData;

export const createSocket = () => {
  const socket = io(BACKEND_URL, {
    query: { walletAddress },
  });

  socket.on("connect", () => handleConnect(socket, walletAddress));
  socket.on("disconnect", () => handleDisconnect(socket));
  socket.on("ping", () => handlePing(socket));
  socket.on("removed", (data) => handleRemoved(socket, data));
  socket.on("giveOffers", async (intent, callback) =>
    handleGiveOffers(socket, intent, callback, walletAddress, feeSchema)
  );
  socket.on("executeTransaction", async (intent, callback) =>
    handleExecuteTransaction(socket, intent, callback, walletAddress)
  );

  return socket;
};
