export interface FeeDetails {
  baseFee: string;
  percentageFee: string;
}

export interface TargetNetworkFees {
  [tokenAddress: `0x${string}`]: FeeDetails;
}

export interface FeeSchema {
  [targetChainId: string]: TargetNetworkFees;
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
