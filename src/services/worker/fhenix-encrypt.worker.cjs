const { parentPort } = require("worker_threads");
const { cofhejs, Encryptable } = require("cofhejs/node");
const { createPublicClient, createWalletClient, http } = require("viem");
const { privateKeyToAccount } = require("viem/accounts");
const { sepolia, arbitrumSepolia, baseSepolia } = require("viem/chains");
require("dotenv").config();

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

    const encrypted = await cofhejs.encrypt([Encryptable.uint64(BigInt(payload.outputAmount))]);

    if (!encrypted.success) {
      throw new Error("Failed to encrypt the output amount");
    }

    const [encryptedAmount] = encrypted.data;

    parentPort.postMessage({
      ok: true,
      encrypted: encryptedAmount,
    });
  } catch (err) {
    parentPort.postMessage({
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    });
  }
});
