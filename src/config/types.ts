export interface FeeDetails {
  baseFee: string;
  percentageFee: string;
}

export interface TargetNetworkFees {
  [tokenAddress: string]: FeeDetails;
}

export interface FeeSchema {
  [targetChainId: string]: TargetNetworkFees;
}
