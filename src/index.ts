import express, { Express } from "express";
import dotenv from "dotenv";
import { io } from "socket.io-client";
import { privateKeyToAddress } from "viem/accounts";
import axios from "axios";

dotenv.config();

// env variables
const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;
if (!PRIVATE_KEY) {
  throw new Error("Private key is not given. Please define it in .env");
}
const BACKEND_URL = process.env.BACKEND_URL;
if (!BACKEND_URL) {
  throw new Error("Backend URL is not given. Please define it in .env");
}

const walletAddress = privateKeyToAddress(PRIVATE_KEY);

const app: Express = express();
const port = process.env.PORT || 3001;

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

const server = app.listen(port, async () => {
  // save relayer address to backend
  await axios.post(`${BACKEND_URL}/save-relayer`, {
    walletAddress,
  });

  console.log(`[relayer]: Relayer is running at http://localhost:${port}`);
});

process.on("SIGINT", async () => {
  // delete relayer address on backend
  console.log("About to close");
  await axios.delete(`${BACKEND_URL}/delete-relayer?walletAddress=${walletAddress}`);
  server.close();
  socket.close();
});
