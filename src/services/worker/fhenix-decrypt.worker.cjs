const { parentPort } = require("worker_threads");
const { cofhejs, FheTypes } = require("cofhejs/node");
const { createPublicClient, createWalletClient, http } = require("viem");
const { privateKeyToAccount } = require("viem/accounts");
const { sepolia, arbitrumSepolia, baseSepolia } = require("viem/chains");
require("dotenv").config();

const FHE_TYPE_MAP = {
  Uint64: FheTypes.Uint64,
  Uint32: FheTypes.Uint32,
  Uint16: FheTypes.Uint16,
  Uint8: FheTypes.Uint8,
};

const chainMap = {
  11155111: { chain: sepolia, rpcEnvKey: "SEPOLIA_RPC_URL" },
  421614: { chain: arbitrumSepolia, rpcEnvKey: "ARBITRUM_SEPOLIA_RPC_URL" },
  84532: { chain: baseSepolia, rpcEnvKey: "BASE_SEPOLIA_RPC_URL" },
};

parentPort.on("message", async (payload) => {
  try {
    const chainConfig = chainMap[payload.chainId];
    if (!chainConfig) {
      throw new Error(`Unsupported chainId for Fhenix: ${payload.chainId}`);
    }

    const rpcUrl = chainConfig.rpcEnvKey ? process.env[chainConfig.rpcEnvKey] : undefined;
    const account = privateKeyToAccount(process.env.PRIVATE_KEY);

    const publicClient = createPublicClient({
      chain: chainConfig.chain,
      transport: http(rpcUrl),
    });

    const walletClient = createWalletClient({
      chain: chainConfig.chain,
      transport: http(rpcUrl),
      account,
    });

    const permit = await cofhejs.initializeWithViem({
      viemClient: publicClient,
      viemWalletClient: walletClient,
      environment: "TESTNET",
    });

    if (!permit || !permit.success || !permit.data) {
      throw new Error("Failed to create Fhenix permit");
    }

    cofhejs.store.setState({
      ...cofhejs.store.getState(),
      chainId: payload.chainId.toString(),
    });

    // Unseal each value
    const results = {};
    for (const item of payload.valuesToUnseal) {
      const fheType = FHE_TYPE_MAP[item.type] || FheTypes.Uint64;
      const unsealedResult = await cofhejs.unseal(BigInt(item.handle), fheType, account.address, permit.data.getHash());

      if (!unsealedResult.success) {
        throw new Error(`Failed to unseal value: ${unsealedResult.error}`);
      }

      results[item.key] = unsealedResult.data.toString();
    }

    parentPort.postMessage({
      ok: true,
      decrypted: results,
    });
  } catch (err) {
    parentPort.postMessage({
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    });
  }
});
