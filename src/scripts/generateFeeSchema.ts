import { Chains, FeeSchema, TokenDetails } from "../config/types";
import networks from "../config/networks";
import fs from "fs";
import promptSync from "prompt-sync";
import { isAddress } from "viem";
import { fetchTokenDecimals, fetchTokenSymbol } from "../lib/utils";

const prompt = promptSync({ sigint: true });

const generateFeeSchema = async () => {
  const aggregatorChoice = prompt("Select aggregator: 0 for Odos, 1 for 1inch: ");
  if (aggregatorChoice !== "0" && aggregatorChoice !== "1") {
    console.error("Invalid input. Please enter 0 for Odos or 1 for 1inch.");
    return;
  }
  const aggregator = aggregatorChoice === "0" ? "Odos" : "1inch";

  const chains = await networks.reduce(async (accPromise, targetNetwork) => {
    const acc = await accPromise;
    const targetChainId = String(targetNetwork.chainId);

    const numTokens = parseInt(prompt(`How many tokens for target chain ${targetChainId}? `), 10);
    if (isNaN(numTokens) || numTokens <= 0) {
      console.error("Invalid number of tokens. Please enter a positive integer.");
      return acc;
    }

    const tokensFees: { [tokenAddress: `0x${string}`]: TokenDetails } = {};

    for (let i = 0; i < numTokens; i++) {
      const tokenAddress = prompt(`Enter token address #${i + 1} for chain ${targetChainId} in 0x format: `);

      if (!isAddress(tokenAddress)) {
        console.error("Invalid token address. Please enter a valid address.");
        i--;
        continue;
      }

      let name;
      let decimals;
      try {
        name = await fetchTokenSymbol(tokenAddress, parseInt(targetChainId));
        decimals = await fetchTokenDecimals(tokenAddress, parseInt(targetChainId));
      } catch (error) {
        console.error("Failed to fetch token details from the contract. Please enter a valid token address.");
        i--;
        continue;
      }

      const baseFee = prompt(`Enter base fee for ${tokenAddress} on chain ${targetChainId}: `);
      if (isNaN(parseFloat(baseFee))) {
        console.error("Invalid base fee. Please enter a valid number.");
        i--;
        continue;
      }

      const percentageFee = prompt(
        `Enter percentage fee for ${tokenAddress} on chain ${targetChainId} (as a percentage without % symbol): `
      );
      if (isNaN(parseFloat(percentageFee))) {
        console.error("Invalid percentage fee. Please enter a valid number.");
        i--;
        continue;
      }

      const swappable =
        prompt(`Is ${tokenAddress} swappable on chain ${targetChainId}? (yes/no): `).toLowerCase() === "yes";

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
  }, Promise.resolve({} as Chains));

  const feeSchema: FeeSchema = {
    aggregator,
    chains,
  };

  fs.writeFileSync("./src/config/feeSchema.json", JSON.stringify(feeSchema, null, 2));
  console.log("Fee schema generated successfully!");
};

generateFeeSchema();
