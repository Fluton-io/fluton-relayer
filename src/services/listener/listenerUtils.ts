import { cofhejs, FheTypes, Encryptable } from "cofhejs/node";
import { Options } from "@layerzerolabs/lz-v2-utilities";
import { ContractIntent, Coprocessor, Token } from "../../config/types";
import CofheBridgeABI from "../../config/abi/cofheBridgeABI";
import FhevmBridgeABI from "../../config/abi/fhevmBridgeABI";
import { getZamaClient, getFhenixPermit, walletClients, publicClients } from "../../config/client";
import addresses from "../../config/addresses";
import tokens from "../../config/tokens";
import { sleep } from "../../lib/utils";
import networks from "../../config/networks";
import { decryptInWorker, encryptInWorker } from "../worker/workerService";
import { nonceManager } from "../nonceManager";

export const handleIntentCreatedPublic = async (intent: ContractIntent) => {
  console.log("To be implemented: handleIntentCreated for public bridge");
};

let tryCountIntentCreated: Record<string, number> = {};

export const handleIntentCreatedFhenix = async (intent: ContractIntent): Promise<any> => {
  try {
    const walletClientSource = walletClients.find((wc) => wc.chainId === intent.originChainId)!.client;

    const permit = await getFhenixPermit(intent.originChainId);
    cofhejs.store.setState({
      ...cofhejs.store.getState(),
      chainId: intent.originChainId.toString(),
    });
    await sleep(8000); // Wait for cofhejs to be ready
    const unsealedOutputAmountResult = await cofhejs.unseal(
      BigInt(intent.outputAmount),
      FheTypes.Uint64,
      walletClientSource.account.address,
      permit.getHash()
    );
    const unsealedDestinationChainIdResult = await cofhejs.unseal(
      BigInt(intent.destinationChainId),
      FheTypes.Uint32,
      walletClientSource.account.address,
      permit.getHash()
    );

    if (!unsealedOutputAmountResult.success || !unsealedDestinationChainIdResult.success) {
      if (!tryCountIntentCreated[String(intent.id)]) {
        tryCountIntentCreated[String(intent.id)] = 1;
      } else {
        tryCountIntentCreated[String(intent.id)]++;
      }

      if (tryCountIntentCreated[String(intent.id)] > 5) {
        throw new Error(
          "Failed to unseal the output amount" +
            unsealedOutputAmountResult.error +
            " " +
            unsealedDestinationChainIdResult.error
        );
      } else {
        console.log(
          `Unsealing failed for intent ${intent.id}, retrying... Attempt ${tryCountIntentCreated[String(intent.id)]}`
        );
        return handleIntentCreatedFhenix(intent);
      }
    }

    console.log("Unsealed output amount:", unsealedOutputAmountResult.data);
    console.log("Unsealed destination chain ID:", unsealedDestinationChainIdResult.data);

    const targetToken: Token = tokens[Number(unsealedDestinationChainIdResult.data)].find(
      (t) => t.address.toLowerCase() === intent.outputToken.toLowerCase()
    )!;
    const targetCoprocessor = targetToken.coprocessor;

    if (targetCoprocessor === Coprocessor.ZAMA) {
      console.log("Fhenix to Zama transfer, decryption needed.");
      return handleFulfillIntentZama(intent, unsealedOutputAmountResult.data, unsealedDestinationChainIdResult.data);
    } else if (targetCoprocessor === Coprocessor.FHENIX) {
      console.log("Fhenix to Fhenix transfer, no decryption needed, but decrypting for now.");
      return handleFulfillIntentFhenix(intent, unsealedOutputAmountResult.data, unsealedDestinationChainIdResult.data);
    } else {
      // return handleFulfillIntentPublic(intent);
      return console.log("Target coprocessor doesn't exist, fulfilling via public bridge (not implemented yet).");
    }
  } catch (error) {
    console.error(
      "Error handling IntentCreated Fhenix:",
      error,
      ", target token address:",
      intent.outputToken.toLowerCase(),
      " chainId:",
      intent.destinationChainId
    );
  }
};

export const handleIntentCreatedZama = async (intent: ContractIntent): Promise<any> => {
  try {
    const walletClientSource = walletClients.find((wc) => wc.chainId === intent.originChainId)!.client;
    const bridgeContractSource = addresses[Number(intent.originChainId)].fhevmBridge;

    const zamaClient = await getZamaClient();
    const keypair = zamaClient.generateKeypair();
    const handleContractPairs = [
      {
        handle: ("0x" + intent.outputAmount.toString(16)) as `0x${string}`,
        contractAddress: bridgeContractSource,
      },
      {
        handle: ("0x" + intent.destinationChainId.toString(16)) as `0x${string}`,
        contractAddress: bridgeContractSource,
      },
    ];
    const startTimeStamp = Math.floor(Date.now() / 1000);
    const durationDays = 365;
    const contractAddresses = [bridgeContractSource];

    const eip712 = zamaClient.createEIP712(keypair.publicKey, contractAddresses, startTimeStamp, durationDays);
    const signature = await walletClientSource.signTypedData({
      domain: { ...eip712.domain, verifyingContract: eip712.domain.verifyingContract as `0x${string}` },
      types: {
        UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification,
      },
      primaryType: "UserDecryptRequestVerification",
      message: eip712.message as Record<string, unknown>,
    });
    await sleep(8000); // Wait for ciphertext to be ready
    const decrypted = (await decryptInWorker({
      handleContractPairs,
      privateKey: keypair.privateKey,
      publicKey: keypair.publicKey,
      signature: signature.replace("0x", ""),
      contractAddresses,
      userAddress: walletClientSource.account.address,
      startTimeStamp,
      durationDays,
    })) as Record<`0x${string}`, bigint>;

    const decryptedOutputAmount = decrypted[("0x" + intent.outputAmount.toString(16)) as `0x${string}`];
    const decryptedDestinationChainId = decrypted[("0x" + intent.destinationChainId.toString(16)) as `0x${string}`];

    if (!decryptedOutputAmount || !decryptedDestinationChainId) {
      if (!tryCountIntentCreated[String(intent.id)]) {
        tryCountIntentCreated[String(intent.id)] = 1;
      } else {
        tryCountIntentCreated[String(intent.id)]++;
      }
      if (tryCountIntentCreated[String(intent.id)] > 5) {
        throw new Error("Failed to decrypt the output amount or destination chain ID");
      } else {
        console.log(
          `Decryption failed for intent ${intent.id}, retrying... Attempt ${tryCountIntentCreated[String(intent.id)]}`
        );
        return handleIntentCreatedZama(intent);
      }
    }

    const targetToken: Token = tokens[Number(decryptedDestinationChainId)].find(
      (t) => t.address.toLowerCase() === intent.outputToken.toLowerCase()
    )!;
    const targetCoprocessor = targetToken.coprocessor;

    if (targetCoprocessor === Coprocessor.ZAMA) {
      console.log("Zama to Zama transfer, no decryption needed, but decrypting for now.");
      return handleFulfillIntentZama(intent, BigInt(decryptedOutputAmount), BigInt(decryptedDestinationChainId));
    } else if (targetCoprocessor === Coprocessor.FHENIX) {
      console.log("Zama to Fhenix transfer, decryption needed.");
      return handleFulfillIntentFhenix(intent, BigInt(decryptedOutputAmount), BigInt(decryptedDestinationChainId));
    } else {
      // return handleFulfillIntentPublic(intent);
      return console.log("Target coprocessor doesn't exist, fulfilling via public bridge (not implemented yet).");
    }
  } catch (error) {
    console.error("Error handling IntentCreated Zama:", error);
  }
};

export const handleFulfillIntentFhenix = async (
  intent: ContractIntent,
  outputAmount: bigint,
  destinationChainId: bigint
) => {
  const cofheBridgeContractAddress = addresses[Number(destinationChainId)].cofheBridge;
  const walletClientDest = walletClients.find((wc) => wc.chainId === Number(destinationChainId))!.client;
  const publicClientDest = publicClients.find((pc) => pc.chainId === Number(destinationChainId))!.client;
  const chainId = Number(destinationChainId);

  const intentArgs = {
    ...intent,
  };

  const permit = await getFhenixPermit(chainId);
  cofhejs.store.setState({
    ...cofhejs.store.getState(),
    chainId: destinationChainId.toString(),
  });
  const encrypted = await cofhejs.encrypt([Encryptable.uint64(outputAmount)]);
  if (!encrypted.success) {
    throw new Error("Failed to encrypt the output amount");
  }
  const [encryptedAmount] = encrypted.data!;

  let nonce: number | undefined;

  try {
    if (!walletClientDest) {
      throw new Error(`Wallet client for chainId ${destinationChainId} not found`);
    }

    const sourceChainEid = networks.find((n) => n.chainId === Number(intent.originChainId))?.layerzeroEid;

    if (!sourceChainEid) {
      throw new Error(`LayerZero EID for chainId ${destinationChainId} not found`);
    }

    const optionsHex = Options.newOptions().addExecutorLzReceiveOption(500_000, 0).toHex() as `0x${string}`;

    const { nativeFee } = await publicClientDest.readContract({
      address: cofheBridgeContractAddress,
      abi: CofheBridgeABI,
      functionName: "quote",
      args: [sourceChainEid, intent.id.toString(), optionsHex, false],
    });

    // Get the next nonce from the nonce manager
    nonce = await nonceManager.getNextNonce(chainId);

    const tx = await walletClientDest.writeContract({
      address: cofheBridgeContractAddress,
      abi: CofheBridgeABI,
      functionName: "fulfill",
      args: [intentArgs, { ...encryptedAmount, signature: encryptedAmount.signature as `0x${string}` }, optionsHex],
      value: nativeFee,
      nonce,
    });
    console.log("Transaction sent, hash:", tx);

    // Confirm the transaction was submitted successfully
    nonceManager.confirmTransaction(chainId);
  } catch (error) {
    console.error("Error when fulfilling intent:", error);

    // Handle nonce failure if we had acquired one
    if (nonce !== undefined) {
      await nonceManager.handleTransactionFailure(chainId, nonce);
    }
  }
};

export const handleFulfillIntentZama = async (
  intent: ContractIntent,
  outputAmount: bigint,
  destinationChainId: bigint
) => {
  const chainId = Number(destinationChainId);
  let nonce: number | undefined;

  try {
    const fhevmBridgeContractAddress = addresses[chainId].fhevmBridge;
    const walletClientDest = walletClients.find((wc) => wc.chainId === chainId)!.client;

    const publicClientDest = publicClients.find((pc) => pc.chainId === chainId)!.client;

    const encrypted = await encryptInWorker({
      fhevmBridgeContractAddress,
      userAddress: walletClientDest.account.address,
      outputAmount: outputAmount.toString(),
    });

    const intentArgs = {
      ...intent,
      inputAmount: ("0x" + BigInt(intent.inputAmount).toString(16)) as `0x${string}`,
      outputAmount: ("0x" + BigInt(intent.outputAmount).toString(16)) as `0x${string}`,
      destinationChainId: ("0x" + BigInt(intent.destinationChainId).toString(16)) as `0x${string}`,
    };

    if (!walletClientDest) {
      throw new Error(`Wallet client for chainId ${destinationChainId} not found`);
    }

    const sourceChainEid = networks.find((n) => n.chainId === Number(intent.originChainId))?.layerzeroEid;

    if (!sourceChainEid) {
      throw new Error(`LayerZero EID for chainId ${destinationChainId} not found`);
    }

    const optionsHex = Options.newOptions().addExecutorLzReceiveOption(500_000, 0).toHex() as `0x${string}`;

    const { nativeFee } = await publicClientDest.readContract({
      address: fhevmBridgeContractAddress,
      abi: FhevmBridgeABI,
      functionName: "quote",
      args: [sourceChainEid, intent.id.toString(), optionsHex, false],
    });

    // Get the next nonce from the nonce manager
    nonce = await nonceManager.getNextNonce(chainId);

    const tx = await walletClientDest.writeContract({
      address: fhevmBridgeContractAddress,
      abi: FhevmBridgeABI,
      functionName: "fulfill",
      args: [
        intentArgs,
        `0x${Buffer.from(encrypted.handles[0]).toString("hex")}`,
        `0x${Buffer.from(encrypted.inputProof).toString("hex")}`,
        optionsHex,
      ],
      value: nativeFee,
      nonce,
    });
    console.log("Transaction sent, hash:", tx);

    // Confirm the transaction was submitted successfully
    nonceManager.confirmTransaction(chainId);
  } catch (error) {
    console.error("Error when fulfilling intent:", error);

    // Handle nonce failure if we had acquired one
    if (nonce !== undefined) {
      await nonceManager.handleTransactionFailure(chainId, nonce);
    }
  }
};
