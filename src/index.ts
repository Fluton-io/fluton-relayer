import express, { Express } from "express";
import dotenv from "dotenv";
import { io } from "socket.io-client";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;

const socket = io("http://localhost:3000");

socket.on("connect", () => {
  console.log(`Relayer connected with ID: ${socket.id}`);
});

socket.on("disconnect", () => {
  console.log("Relayer disconnected");
});

socket.on("giveOffers", (intent) => {
  console.log("Received intent:", intent);

  const parsedIntent = JSON.parse(intent);

  const fee = Math.floor(Math.random() * 10) + 1;
  const price = 1.01;
  const targetAmount = price * Number(parsedIntent.amount) - fee;

  console.log(`Parsed intent:`, parsedIntent);
  console.log(`Calculated targetAmount: ${targetAmount}, fee: ${fee}`);
});

app.listen(port, () => {
  console.log(`[relayer]: Relayer is running at http://localhost:${port}`);
});
