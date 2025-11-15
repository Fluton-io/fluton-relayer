export enum Coprocessor {
  ZAMA,
  FHENIX,
  INCO,
}

export interface Token {
  symbol: string;
  address: `0x${string}`;
  decimals: number;
  chainId: number;
  underlyingTokenAddress?: `0x${string}`;
  isConfidential?: boolean;
  apiPriceTokenSymbol?: string;
  coprocessor?: Coprocessor;
}

export interface TokenDetails {
  name: string;
  baseFee: string;
  percentageFee: string;
  swappable: boolean;
  decimals: number;
  balance: number;
}
export interface Network {
  name: string;
  chainId: number;
  rpcUrl: string;
  wsUrl?: string;
  explorer: {
    name: string;
    apiKey: string | null;
    url: string;
  };
  contracts: Record<string, { address: `0x${string}`; coprocessor?: Coprocessor }>;
  tokens: Token[];
  coprocessors?: Coprocessor[];
}

export interface TargetNetworkDetails {
  [tokenAddress: `0x${string}`]: TokenDetails;
}

export interface Chains {
  [targetChainId: string]: TargetNetworkDetails;
}

export interface FeeSchema {
  aggregator: string;
  chains: Chains;
}

export interface Intent {
  sourceChainId: string;
  targetChainId: string;
  sourceTokenAddress: `0x${string}`;
  sourceTokenSymbol: string;
  targetTokenAddress: `0x${string}`;
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
  destinationChainId: bigint;
  filledStatus: number;
  solverPaid: boolean;
  timeout: bigint;
}
