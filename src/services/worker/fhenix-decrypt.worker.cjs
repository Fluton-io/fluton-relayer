const { parentPort } = require("worker_threads");
const { FheTypes } = require("@cofhe/sdk");
const { createCofheConfig, createCofheClient } = require("@cofhe/sdk/node");
const { chains } = require("@cofhe/sdk/chains");
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

    const permit = await cofheClient.permits.getOrCreateSelfPermit();

    const results = {};
    for (const item of payload.valuesToUnseal) {
      const fheType = FHE_TYPE_MAP[item.type] || FheTypes.Uint64;
      const unsealed = await cofheClient
        .decryptForView(BigInt(item.handle), fheType)
        .withPermit(permit)
        .execute();

      results[item.key] = unsealed.toString();
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
