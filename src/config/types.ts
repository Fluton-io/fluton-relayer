export interface TokenDetails {
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
