const testnetToMainnetToken: { [key: `0x${string}`]: `0x${string}` } = {
  // sepolia -> mainnet

  // usdc
  "0x2831d2b6b7bd5Ca9E2EEe932055a91f5a6cEBe2f": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",

  // arbitrum sepolia -> arbitrum mainnet

  // usdc
  "0x1746FB6484647F83E27Ed43460bbE30883F8F5b5": "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
};

export default testnetToMainnetToken;
