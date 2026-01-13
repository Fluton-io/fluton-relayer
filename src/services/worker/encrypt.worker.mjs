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

    const encrypted = await zamaClient
      .createEncryptedInput(payload.fhevmBridgeContractAddress, payload.userAddress)
      .add64(BigInt(payload.outputAmount))
      .encrypt();

    parentPort.postMessage({
      ok: true,
      encrypted: {
        handles: encrypted.handles,
        inputProof: encrypted.inputProof,
      },
    });
  } catch (err) {
    parentPort.postMessage({
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    });
  }
});
