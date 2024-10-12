import express, { Express } from "express";
import { createSocket } from "./services/socket";
import { PORT } from "./config/env";

const app: Express = express();
const port = PORT;

export const startServer = () => {
  const socket = createSocket();

  const server = app.listen(port, async () => {
    console.log(`[relayer]: Relayer is running at http://localhost:${port}`);
  });

  process.on("SIGINT", async () => {
    console.log("About to close");

    server.close();
    socket.close();
  });
};
