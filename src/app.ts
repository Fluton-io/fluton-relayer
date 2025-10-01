import express, { Express } from "express";
import { PORT } from "./config/env";
import { createSocket } from "./services/socketService";
import { listenBridgeEvents } from "./services/listenerService";
import { websocketClients } from "./config/client";

const app: Express = express();
const port = PORT;

export const startServer = () => {
  const socket = createSocket();

  const server = app.listen(port, async () => {
    console.log(`[relayer]: Relayer is running at http://localhost:${port}`);

    listenBridgeEvents();
  });

  process.on("SIGINT", async () => {
    console.log("About to close, please wait.");

    // Close all websocket connections
    await Promise.all(
      websocketClients.map(async ({ client }) => {
        const rpcClient = await client.transport.getRpcClient();
        return rpcClient.close();
      })
    );

    server.close();
    socket.close();
  });
};
