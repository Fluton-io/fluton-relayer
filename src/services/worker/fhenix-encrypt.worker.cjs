const { parentPort } = require("worker_threads");
const { Encryptable } = require("@cofhe/sdk");
const { createCofheConfig, createCofheClient } = require("@cofhe/sdk/node");
const { chains } = require("@cofhe/sdk/chains");
const { createPublicClient, createWalletClient, http } = require("viem");
const { privateKeyToAccount } = require("viem/accounts");
const { sepolia, arbitrumSepolia, baseSepolia } = require("viem/chains");
require("dotenv").config();

const chainMap = {
  11155111: { chain: sepolia, cofheChain: chains.sepolia, rpcEnvKey: "SEPOLIA_RPC_URL" },
  421614: { chain: arbitrumSepolia, cofheChain: chains.arbSepolia, rpcEnvKey: "ARBITRUM_SEPOLIA_RPC_URL" },
  84532: { chain: baseSepolia, cofheChain: chains.baseSepolia, rpcEnvKey: "BASE_SEPOLIA_RPC_URL" },
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

    const cofheConfig = createCofheConfig({
      supportedChains: [chainConfig.cofheChain],
    });
    const cofheClient = createCofheClient(cofheConfig);
    await cofheClient.connect(publicClient, walletClient);

    const [encryptedAmount] = await cofheClient
      .encryptInputs([Encryptable.uint64(BigInt(payload.outputAmount))])
      .execute();

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
