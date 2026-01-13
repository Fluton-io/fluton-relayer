import { parentPort } from "worker_threads";
import { createInstance, SepoliaConfig } from "@zama-fhe/relayer-sdk/node";
import dotenv from "dotenv";
dotenv.config();

parentPort.on("message", async (payload) => {
  try {
    const config = {
      ...SepoliaConfig,
      network: process.env.SEPOLIA_RPC_URL,
      relayerUrl: `${SepoliaConfig.relayerUrl}/v2`,
    };

    const zamaClient = await createInstance(config);

    const decrypted = await zamaClient.userDecrypt(
      payload.handleContractPairs,
      payload.privateKey,
      payload.publicKey,
      payload.signature,
      payload.contractAddresses,
      payload.userAddress,
      payload.startTimeStamp,
      payload.durationDays
    );

    parentPort.postMessage({
      ok: true,
      decrypted: JSON.parse(JSON.stringify(decrypted, (_, v) => (typeof v === "bigint" ? v.toString() : v))),
    });
  } catch (err) {
    parentPort.postMessage({
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    });
  }
});
