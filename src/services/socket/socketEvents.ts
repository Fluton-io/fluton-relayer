import { Socket } from "socket.io-client";
import { FeeSchema, IBridgeSignaturePayload, Intent } from "../../config/types";
import { calculateAmountWithAggregator, findTokenCombinations } from "../aggregatorService";
import testnetToMainnet from "../../config/testnetToMainnet";
import testnetToMainnetToken from "../../config/testnetToMainnetToken";
import { Address, erc20Abi, isAddress, PublicClient } from "viem";
import { getPrice } from "../aggregator/priceUtils";
import { publicClients, walletClients } from "../../config/client";
import { getTokenBridgeContract } from "../../lib/utils";
import bridgeABI from "../../config/bridgeABI";
export const handleConnect = (socket: Socket, walletAddress: `0x${string}`) => {
  console.log(`Relayer connected with ID: ${socket.id}, Wallet: ${walletAddress}`);
};

export const handleDisconnect = (socket: Socket) => {
  console.log("Relayer disconnected");
};

export const handlePing = (socket: Socket) => {
  console.log("Received ping from backend, sending pong...");
  socket.emit("pong");
};

export const handleRemoved = (socket: Socket, data: any) => {
  console.log("Received removal notification:", data.message);
  socket.disconnect();
};

export const handleGiveOffers = async (
  socket: Socket,
  intent: Intent,
  callback: any,
  walletAddress: `0x${string}`,
  feeSchema: FeeSchema
) => {
  console.log("Received intent:", intent);
  const { sourceChainId, targetChainId, sourceTokenAddress, targetTokenAddress, amount } = intent;

  const sourceChainIdMainnet = testnetToMainnet[sourceChainId] || sourceChainId;
  const targetChainIdMainnet = testnetToMainnet[targetChainId] || targetChainId;

  console.log("sourceChainIdMainnet:", sourceChainIdMainnet);
  console.log("targetChainIdMainnet:", targetChainIdMainnet);

  const sourceTokenAddressMainnet = testnetToMainnetToken[sourceTokenAddress] || sourceTokenAddress;
  const targetTokenAddressMainnet = testnetToMainnetToken[targetTokenAddress] || targetTokenAddress;

  console.log("sourceTokenAddressMainnet:", sourceTokenAddressMainnet);
  console.log("targetTokenAddressMainnet:", targetTokenAddressMainnet);

  if (!isAddress(sourceTokenAddressMainnet)) {
    console.error("Invalid source token address");
    callback({ status: "error", walletAddress, message: "Invalid source token address" });
    return;
  }

  if (!isAddress(targetTokenAddressMainnet)) {
    console.error("Invalid target token address");
    callback({ status: "error", walletAddress, message: "Invalid target token address" });
    return;
  }

  // TODO: Also check if sourceToken and targetToken are actual ERC-20 tokens

  const schemaForTargetChain = feeSchema.chains[targetChainIdMainnet];

  if (!schemaForTargetChain) {
    console.error(`Chain ID ${targetChainIdMainnet} not supported by the relayer.`);
    callback({ status: "error", walletAddress, message: `Chain ID ${targetChainIdMainnet} not supported.` });
    return;
  }

  try {
    const sourceTokenPrice = (await getPrice(+sourceChainIdMainnet, sourceTokenAddressMainnet))[
      sourceTokenAddressMainnet
    ];
    console.log("Source token price:", sourceTokenPrice);

    const sourceAmountInUSD = sourceTokenPrice * Number(amount);
    console.log("sourceAmountInUSD:", sourceAmountInUSD);

    console.log("schemaForTargetChain:", schemaForTargetChain);
    const relayerTargetToken = schemaForTargetChain[targetTokenAddressMainnet];
    console.log("relayer target token:", relayerTargetToken);
    const relayerTargetTokenPrice = (await getPrice(parseInt(targetChainIdMainnet), targetTokenAddressMainnet))[
      targetTokenAddressMainnet
    ];
    console.log("relayer target token price:", relayerTargetTokenPrice);
    const relayerTargetTokenValue = relayerTargetTokenPrice * Number(relayerTargetToken.balance);
    console.log("relayer target token value:", relayerTargetTokenValue);
    let result;
    if (relayerTargetToken && relayerTargetTokenValue >= Number(sourceAmountInUSD)) {
      // if relayer has enough target token, calculate the target amount
      const { baseFee, percentageFee } = relayerTargetToken;
      const targetTokenTransferAmount = sourceAmountInUSD / relayerTargetTokenPrice;
      console.log("targetTokenTransferAmount:", targetTokenTransferAmount);
      const baseFeeValue = parseFloat(baseFee);
      const percentageFeeValue = parseFloat(percentageFee) / 100;
      const totalFee = baseFeeValue + targetTokenTransferAmount * percentageFeeValue;
      const targetAmount = targetTokenTransferAmount - totalFee;

      result = { finalTargetAmount: targetAmount, pathViz: null };
    } else {
      // If relayer doesn't have enough target token, find token combinations and calculate the target amount
      const tokenCombination = await findTokenCombinations(targetChainIdMainnet, String(sourceAmountInUSD));
      console.log("Token combinations:", tokenCombination);
      result = await calculateAmountWithAggregator(
        targetChainIdMainnet,
        targetTokenAddressMainnet,
        walletAddress,
        tokenCombination
      );
    }

    console.log(`Calculated targetAmount: ${result.finalTargetAmount}`);
    callback({
      status: "ok",
      walletAddress,
      targetAmount: result.finalTargetAmount,
      pathViz: result.pathViz,
    });
  } catch (error) {
    console.error("Error in giveOffers:", error);
    callback({ status: "error", walletAddress, message: "Error processing the offer" });
  }
};

export const handleExecuteTransaction = async (
  socket: Socket,
  payload: IBridgeSignaturePayload,
  callback: any,
  walletAddress: `0x${string}`,
) => {
  try {

  const sourceChainIdMainnet = testnetToMainnet[payload.sourceChainId] || payload.sourceChainId;
  const targetChainIdMainnet = testnetToMainnet[payload.targetChainId] || payload.targetChainId;

  console.log("sourceChainIdMainnet:", sourceChainIdMainnet);
  console.log("targetChainIdMainnet:", targetChainIdMainnet);

  const sourceTokenAddressMainnet = testnetToMainnetToken[payload.sourceToken] || payload.sourceToken;
  const targetTokenAddressMainnet = testnetToMainnetToken[payload.targetToken] || payload.targetToken;

  console.log("sourceTokenAddressMainnet:", sourceTokenAddressMainnet);
  console.log("targetTokenAddressMainnet:", targetTokenAddressMainnet);

  const publicClient = publicClients.find((client) => client.chainId === payload.sourceChainId);

  if (!publicClient) {
    console.error("Invalid publicClient");
    callback({ status: "error", walletAddress, message: "Invalid publicClient" });
    return
  }

  const walletClient = walletClients.find((wc) => wc.chainId === payload.sourceChainId)?.client;

  if (!walletClient) {
    console.error("Invalid walletClient");
    callback({ status: "error", walletAddress, message: "Invalid walletClient" });
    return
  }

  const bridgeContract = getTokenBridgeContract(payload.sourceChainId)

  const allowance = await publicClient.client.readContract({
    address: sourceTokenAddressMainnet as Address,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [payload.permitParams.owner as Address, bridgeContract as Address],
  })

  if (allowance < BigInt(payload.sourceAmount)) {

    const { request } = await (publicClient.client as PublicClient).simulateContract({
      address: sourceTokenAddressMainnet as Address,
      abi: erc20Abi,
      functionName: 'approve',
      args: [bridgeContract as Address, BigInt(payload.sourceAmount)],
      account: walletAddress
    })
    const txHash = await walletClient.writeContract(request)

    const transaction = await publicClient.client.waitForTransactionReceipt( 
      { hash: txHash }
    )

    if (transaction.status !== 'success') {
      console.error("Approve transaction failed");
      callback({ status: "error", walletAddress, message: "Approve transaction failed" });
      return
    }
    console.log('Permit transaction successful');

    
  }else {
    console.log('Allowance is sufficient, skipping permit');
  }

  const { request } = await (publicClient.client as PublicClient).simulateContract({
    address: bridgeContract as Address,
    abi: bridgeABI,
    functionName: 'bridgeWithPermit',
    args: [payload.bridgeParams],
    account: walletAddress
  })

  const txHash = await walletClient.writeContract(request)

  const transaction = await publicClient.client.waitForTransactionReceipt( 
    { hash: txHash }
  )

  if (transaction.status !== 'success') {
    console.error("Bridge transaction failed");
    callback({ status: "error", walletAddress, message: "Bridge transaction failed" });
    return
  }
  console.log('Bridge transaction successful');
  
  callback({
    status: "ok",
    walletAddress,
    txHash: txHash,
    
  });
  } catch (error) {
    console.error("Error in giveOffers:", error);
    callback({ status: "error", walletAddress, message: "Bridge transaction failed" });
  }
}
