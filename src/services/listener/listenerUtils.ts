import { ContractIntent, Coprocessor, Token } from "../../config/types";
import CofheBridgeABI from "../../config/abi/cofheBridgeABI";
import FhevmBridgeABI from "../../config/abi/fhevmBridgeABI";
import { getZamaClient, getFhenixPermit, walletClients } from "../../config/client";
import { cofhejs, FheTypes, Encryptable } from "cofhejs/node";
import addresses from "../../config/addresses";
import tokens from "../../config/tokens";
import { sleep } from "../../lib/utils";

export const handleIntentCreatedPublic = async (intent: ContractIntent) => {
  console.log("To be implemented: handleIntentCreated for public bridge");
};

export const handleIntentCreatedFhenix = async (intent: ContractIntent) => {
  try {
    const walletClientSource = walletClients.find((wc) => wc.chainId === intent.originChainId)!.client;

    const permit = await getFhenixPermit(intent.originChainId);
    cofhejs.store.setState({
      ...cofhejs.store.getState(),
      chainId: intent.originChainId.toString(),
    });
    await sleep(4000); // Wait for cofhejs to be ready
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
      throw new Error(
        "Failed to unseal the output amount" +
          unsealedOutputAmountResult.error +
          " " +
          unsealedDestinationChainIdResult.error
      );
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

export const handleIntentCreatedZama = async (intent: ContractIntent) => {
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
    const startTimeStamp = Math.floor(Date.now() / 1000).toString();
    const durationDays = "10"; // String for consistency
    const contractAddresses = [bridgeContractSource];

    const eip712 = zamaClient.createEIP712(keypair.publicKey, contractAddresses, startTimeStamp, durationDays);
    const signature = await walletClientSource.signTypedData({
      domain: { ...eip712.domain, verifyingContract: eip712.domain.verifyingContract as `0x${string}` },
      types: {
        UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification,
      },
      primaryType: "UserDecryptRequestVerification",
      message: eip712.message,
    });
    const decrypted = await zamaClient.userDecrypt(
      handleContractPairs,
      keypair.privateKey,
      keypair.publicKey,
      signature.replace("0x", ""),
      contractAddresses,
      walletClientSource.account.address,
      startTimeStamp,
      durationDays
    );

    const decryptedOutputAmount = decrypted[("0x" + intent.outputAmount.toString(16)) as `0x${string}`] as bigint;
    const decryptedDestinationChainId = decrypted[
      ("0x" + intent.destinationChainId.toString(16)) as `0x${string}`
    ] as bigint;

    const targetToken: Token = tokens[Number(decryptedDestinationChainId)].find(
      (t) => t.address.toLowerCase() === intent.outputToken.toLowerCase()
    )!;
    const targetCoprocessor = targetToken.coprocessor;

    if (targetCoprocessor === Coprocessor.ZAMA) {
      console.log("Zama to Zama transfer, no decryption needed, but decrypting for now.");
      return handleFulfillIntentZama(intent, decryptedOutputAmount, decryptedDestinationChainId);
    } else if (targetCoprocessor === Coprocessor.FHENIX) {
      console.log("Zama to Fhenix transfer, decryption needed.");
      return handleFulfillIntentFhenix(intent, decryptedOutputAmount, decryptedDestinationChainId);
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

  const intentArgs = {
    ...intent,
  };

  const permit = await getFhenixPermit(Number(destinationChainId));
  cofhejs.store.setState({
    ...cofhejs.store.getState(),
    chainId: destinationChainId.toString(),
  });
  const encrypted = await cofhejs.encrypt([Encryptable.uint64(outputAmount)]);
  if (!encrypted.success) {
    throw new Error("Failed to encrypt the output amount");
  }
  const [encryptedAmount] = encrypted.data!;

  try {
    if (!walletClientDest) {
      throw new Error(`Wallet client for chainId ${destinationChainId} not found`);
    }

    const tx = await walletClientDest.writeContract({
      address: cofheBridgeContractAddress,
      abi: CofheBridgeABI,
      functionName: "fulfill",
      args: [intentArgs, { ...encryptedAmount, signature: encryptedAmount.signature as `0x${string}` }],
    });
    console.log("Transaction sent, hash:", tx);
  } catch (error) {
    console.error("Error when fulfilling intent:", error);
  }
};

export const handleFulfillIntentZama = async (
  intent: ContractIntent,
  outputAmount: bigint,
  destinationChainId: bigint
) => {
  const fhevmBridgeContractAddress = addresses[Number(destinationChainId)].fhevmBridge;
  const walletClientDest = walletClients.find((wc) => wc.chainId === Number(destinationChainId))!.client;

  const zamaClient = await getZamaClient();

  const encrypted = await zamaClient
    .createEncryptedInput(fhevmBridgeContractAddress, walletClientDest.account.address)
    .add64(outputAmount)
    .encrypt();

  const intentArgs = {
    ...intent,
    inputAmount: ("0x" + BigInt(intent.inputAmount).toString(16)) as `0x${string}`,
    outputAmount: ("0x" + BigInt(intent.outputAmount).toString(16)) as `0x${string}`,
    destinationChainId: ("0x" + BigInt(intent.destinationChainId).toString(16)) as `0x${string}`,
  };

  try {
    if (!walletClientDest) {
      throw new Error(`Wallet client for chainId ${destinationChainId} not found`);
    }

    const tx = await walletClientDest.writeContract({
      address: fhevmBridgeContractAddress,
      abi: FhevmBridgeABI,
      functionName: "fulfill",
      args: [
        intentArgs,
        `0x${Buffer.from(encrypted.handles[0]).toString("hex")}`,
        `0x${Buffer.from(encrypted.inputProof).toString("hex")}`,
      ],
    });
    console.log("Transaction sent, hash:", tx);
  } catch (error) {
    console.error("Error when fulfilling intent:", error);
  }
};
