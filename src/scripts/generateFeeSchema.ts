import { Chains, FeeSchema, TokenDetails } from "../config/types";
import networks from "../config/networks";
import fs from "fs";
import promptSync from "prompt-sync";
import { isAddress } from "viem";

const prompt = promptSync({ sigint: true });

const generateFeeSchema = () => {
  const aggregatorChoice = prompt("Select aggregator: 0 for Odos, 1 for 1inch: ");
  if (aggregatorChoice !== "0" && aggregatorChoice !== "1") {
    console.error("Invalid input. Please enter 0 for Odos or 1 for 1inch.");
    return;
  }
  const aggregator = aggregatorChoice === "0" ? "Odos" : "1inch";

  const chains = networks.reduce((acc, targetNetwork) => {
    const targetChainId = String(targetNetwork.chainId);

    const numTokens = parseInt(prompt(`How many tokens for target chain ${targetChainId}? `), 10);
    if (isNaN(numTokens) || numTokens <= 0) {
      console.error("Invalid number of tokens. Please enter a positive integer.");
      return acc;
    }

    const tokensFees: { [tokenAddress: `0x${string}`]: TokenDetails } = {};

    for (let i = 0; i < numTokens; i++) {
      const tokenAddress = prompt(`Enter token address #${i + 1} for chain ${targetChainId} in 0x{string} format: `);

      if (!isAddress(tokenAddress)) {
        console.error("Invalid token address. Please enter a valid address.");
        i--;
        continue;
      }

      const name = prompt(`Enter the symbol of the token at address ${tokenAddress} on chain ${targetChainId}: `);

      const baseFee = prompt(`Enter base fee for ${tokenAddress} on chain ${targetChainId}: `);
      if (isNaN(parseFloat(baseFee))) {
        console.error("Invalid base fee. Please enter a valid number.");
        i--;
        continue;
      }

      const percentageFee = prompt(
        `Enter percentage fee for ${tokenAddress} on chain ${targetChainId} (as a percentage): `
      );
      if (isNaN(parseFloat(percentageFee))) {
        console.error("Invalid percentage fee. Please enter a valid number.");
        i--;
        continue;
      }

      const swappable =
        prompt(`Is ${tokenAddress} swappable on chain ${targetChainId}? (yes/no): `).toLowerCase() === "yes";

      const decimals = parseInt(prompt(`Enter the decimals for ${tokenAddress} on chain ${targetChainId}: `), 10);
      if (isNaN(decimals) || decimals <= 0) {
        console.error("Invalid decimals. Please enter a positive integer.");
        i--;
        continue;
      }

      const balance = parseInt(prompt(`Enter your balance for ${tokenAddress} on chain ${targetChainId}: `), 10);
      if (isNaN(balance) || balance < 0) {
        console.error("Invalid balance. Please enter a non-negative integer.");
        i--;
        continue;
      }

      tokensFees[tokenAddress] = {
        name,
        baseFee,
        percentageFee: `${percentageFee}%`,
        swappable,
        decimals,
        balance,
      };
    }

    acc[targetChainId] = tokensFees;
    return acc;
  }, {} as Chains);

  const feeSchema: FeeSchema = {
    aggregator,
    chains,
  };

  fs.writeFileSync("./src/config/feeSchema.json", JSON.stringify(feeSchema, null, 2));
  console.log("Fee schema generated successfully!");
};

generateFeeSchema();
