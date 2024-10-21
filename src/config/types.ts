export interface TokenDetails {
  name: string;
  baseFee: string;
  percentageFee: string;
  swappable: boolean;
  decimals: number;
  balance: number;
}

export interface TargetNetworkDetails {
  [tokenAddress: `0x${string}`]: TokenDetails;
}

export interface FeeSchema {
  [targetChainId: string]: TargetNetworkDetails;
}
export interface Intent {
  sourceNetwork: string;
  targetNetwork: string;
  sourceToken: `0x${string}`;
  sourceTokenSymbol: string;
  targetToken: `0x${string}`;
  targetTokenSymbol: string;
  amount: string;
}

export interface ContractIntent {
  sender: `0x${string}`;
  receiver: `0x${string}`;
  relayer: `0x${string}`;
  inputToken: `0x${string}`;
  outputToken: `0x${string}`;
  inputAmount: bigint;
  outputAmount: bigint;
  id: bigint;
  originChainId: number;
  destinationChainId: number;
  filledStatus: number;
}
