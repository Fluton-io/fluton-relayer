import { FeeSchema, TokenDetails } from "../config/types";
import networks from "../config/networks";
import fs from "fs";
import promptSync from "prompt-sync";

const prompt = promptSync({ sigint: true });

const generateFeeSchema = () => {
  const feeSchemaJSON = networks.reduce((acc, targetNetwork) => {
    const targetChainId = String(targetNetwork.chainId);

    const numTokens = parseInt(prompt(`How many tokens for target chain ${targetChainId}? `), 10);
    const tokensFees: { [tokenAddress: `0x${string}`]: TokenDetails } = {};

    for (let i = 0; i < numTokens; i++) {
      const tokenAddress = prompt(`Enter token address #${i + 1} for chain ${targetChainId} in 0x{string} format: `);
      const baseFee = prompt(`Enter base fee for ${tokenAddress} on chain ${targetChainId}: `);
      const percentageFee = prompt(
        `Enter percentage fee for ${tokenAddress} on chain ${targetChainId} (as a percentage): `
      );
      const swappable =
        prompt(`Is ${tokenAddress} swappable on chain ${targetChainId}? (yes/no): `).toLowerCase() === "yes";

      const decimals = parseInt(prompt(`Enter the decimals for ${tokenAddress} on chain ${targetChainId}: `), 10);

      tokensFees[tokenAddress as `0x${string}`] = {
        baseFee,
        percentageFee: `${percentageFee}%`,
        swappable,
        decimals,
      };
    }

    acc[targetChainId] = tokensFees;
    return acc;
  }, {} as FeeSchema);

  fs.writeFileSync("./src/config/feeSchema.json", JSON.stringify(feeSchemaJSON, null, 2));
  console.log("Fee schema generated successfully!");
};

generateFeeSchema();
