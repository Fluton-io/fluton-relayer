# Fluton Relayer

A backend relayer service for the [Fluton](https://github.com/Fluton-io) cross-chain bridge. It listens for bridge intents on-chain, decrypts confidential transfer data using FHE (Fully Homomorphic Encryption), and fulfills cross-chain transfers via LayerZero v2.

## Features

- **FHE-powered privacy** — Decrypts confidential intent data using Zama (FHEVM) and Fhenix (CoFHE) coprocessors
- **Cross-chain fulfillment** — Submits fulfillment transactions on destination chains via LayerZero v2
- **DEX aggregation** — Fetches prices and swap quotes from Odos, 1inch, and Pyth Hermes
- **Multi-token combinations** — Automatically composes token baskets when the relayer lacks sufficient balance of the target token
- **Real-time coordination** — Communicates with the Fluton backend over Socket.IO to provide offers (`giveOffers`)

## Architecture

```
┌─────────────────┐     Socket.IO      ┌──────────────────┐
│ Fluton Backend  │ ◄────────────────► │  fluton-relayer  │
└─────────────────┘                    └────────┬─────────┘
                                                │
                    ┌───────────────────────────┼────────────────────┐
                    │                           │                    │
                    ▼                           ▼                    ▼
           ┌────────────────┐          ┌────────────────┐   ┌────────────────┐
           │ Bridge Events  │          │ DEX Aggregator │   │  FHE Workers   │
           │ (WebSocket)    │          │ (Odos / 1inch) │   │ (encrypt /     │
           │ IntentCreated  │          │ Price & Quote  │   │  decrypt)      │
           └───────┬────────┘          └────────────────┘   └───────┬────────┘
                   │                                                │
                   ▼                                                │
           ┌────────────────┐                                       │
           │ Listener Utils │◄──────────────────────────────────────┘
           │  - Fhenix      │   (decrypt intent → encrypt for destination)
           │  - Zama        │
           │  - Fulfill     │
           └───────┬────────┘
                   │
                   ▼
           ┌────────────────┐
           │  LayerZero v2  │
           │  fulfill() tx  │
           └────────────────┘
```

### Key Components


| Component               | Path                                     | Description                                                              |
| ----------------------- | ---------------------------------------- | ------------------------------------------------------------------------ |
| **Entry point**         | `src/index.ts` / `src/app.ts`            | Starts Express server, Socket.IO client, and bridge listeners            |
| **Socket service**      | `src/services/socketService.ts`          | Connects to Fluton backend; handles `giveOffers`, `ping`, etc.           |
| **Listener service**    | `src/services/listenerService.ts`        | Subscribes to `IntentCreated` events on CoFHE, FHEVM, and public bridges |
| **Listener utils**      | `src/services/listener/listenerUtils.ts` | Decrypts intents, routes to correct fulfillment path (Fhenix or Zama)    |
| **Aggregator service**  | `src/services/aggregatorService.ts`      | Token combination logic, fee calculation, target amount computation      |
| **Price / Quote utils** | `src/services/aggregator/`               | Odos, 1inch, and Pyth Hermes price feeds; swap quote generation          |
| **Worker service**      | `src/services/workerService.ts`          | Runs FHE encrypt/decrypt operations in worker threads                    |
| **Nonce manager**       | `src/services/nonceManager.ts`           | Per-chain nonce handling for concurrent transactions                     |
| **Config**              | `src/config/`                            | ABIs, contract addresses, chain definitions, token metadata, fee schema  |


## Prerequisites

- [Node.js](https://nodejs.org/) v22+
- [Yarn](https://yarnpkg.com/) v4 (`packageManager` is set to `yarn@4.9.2`)

## Setup

### 1. Install dependencies

```bash
yarn install
```

### 2. Configure environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```


| Variable                   | Required | Description                                           |
| -------------------------- | -------- | ----------------------------------------------------- |
| `PRIVATE_KEY`              | Yes      | Relayer wallet private key (`0x`-prefixed)            |
| `BACKEND_URL`              | Yes      | Fluton backend URL for Socket.IO                      |
| `PORT`                     | No       | Server port (default: `3001`)                         |
| `INFURA_API_KEY`           | Yes      | Infura API key for RPC endpoints                      |
| `ONEINCH_API_KEY`          | No       | 1inch API key (needed for 1inch aggregator)           |
| `ODOS_API_URL`             | No       | Odos API base URL (default: `https://api.odos.xyz`)   |
| `ONEINCH_API_URL`          | No       | 1inch API base URL (default: `https://api.1inch.dev`) |
| `SEPOLIA_RPC_URL`          | Yes*     | Sepolia HTTP RPC URL                                  |
| `SEPOLIA_WS_URL`           | Yes*     | Sepolia WebSocket URL                                 |
| `ARBITRUM_SEPOLIA_RPC_URL` | Yes*     | Arbitrum Sepolia HTTP RPC URL                         |
| `ARBITRUM_SEPOLIA_WS_URL`  | Yes*     | Arbitrum Sepolia WebSocket URL                        |
| `BASE_SEPOLIA_RPC_URL`     | Yes*     | Base Sepolia HTTP RPC URL                             |
| `BASE_SEPOLIA_WS_URL`      | Yes*     | Base Sepolia WebSocket URL                            |


Required for the chains you intend to relay on.

### 3. Configure fees

A fee schema (`src/config/feeSchema.json`) defines base fees, percentage fees, and decimals per chain/token pair. Generate or update it interactively:

```bash
yarn generate-fee-schema
```

## Usage

### Development

```bash
yarn dev
```

Runs the relayer with `nodemon` for automatic restarts on file changes.

### Production

```bash
yarn build
yarn start
```

### Docker

```bash
docker build -t fluton-relayer .
docker run --env-file .env -p 3001:3001 fluton-relayer
```

## Supported Networks


| Network          | Type    | FHE Coprocessor              |
| ---------------- | ------- | ---------------------------- |
| Sepolia          | Testnet | Zama (FHEVM), Fhenix (CoFHE) |
| Arbitrum Sepolia | Testnet | Fhenix (CoFHE)               |
| Base Sepolia     | Testnet | Fhenix (CoFHE)               |
| Fhenix Nitrogen  | Testnet | Native                       |
| Ethereum         | Mainnet | —                            |
| Arbitrum         | Mainnet | —                            |
| Optimism         | Mainnet | —                            |
| Base             | Mainnet | —                            |
| Scroll           | Mainnet | —                            |


## Tech Stack

- **TypeScript** + **Node.js**
- **viem** / **ethers** — Blockchain interaction
- **@zama-fhe/relayer-sdk** — Zama FHEVM encryption & decryption
- **cofhejs** — Fhenix CoFHE encryption & decryption
- **@layerzerolabs/lz-v2-utilities** — Cross-chain messaging
- **Express** — HTTP server
- **socket.io-client** — Real-time communication with backend
- **axios** — HTTP requests to aggregator APIs

## Project Structure

```
src/
├── index.ts                          # Entry point
├── app.ts                            # Express server & startup
├── config/
│   ├── abi/                          # Bridge & token ABIs
│   ├── addresses.ts                  # Contract addresses per chain
│   ├── client.ts                     # viem public, wallet & websocket clients
│   ├── constants.ts                  # Zama gateway URL, misc constants
│   ├── contracts.ts                  # Bridge contract configs
│   ├── custom-chains.ts             # Fhenix Nitrogen chain definition
│   ├── env.ts                        # Environment variable loading
│   ├── feeSchema.json                # Fee configuration
│   ├── networks.ts                   # Network definitions
│   ├── testnetToMainnet.ts          # Testnet → mainnet chain mapping
│   ├── testnetToMainnetToken.ts     # Testnet → mainnet token mapping
│   ├── tokens.ts                     # Token metadata
│   └── types.ts                      # Shared types
├── lib/
│   ├── cache.ts                      # Cache
│   └── utils.ts                      # Helpers, fee loading, aggregator utils
├── scripts/
│   └── generateFeeSchema.ts         # Interactive fee schema generator
└── services/
    ├── aggregator/
    │   ├── priceUtils.ts             # Price feeds (Odos, 1inch, Pyth)
    │   └── quoteUtils.ts            # Swap quotes (Odos, 1inch)
    ├── aggregatorService.ts          # Token combination & fee logic
    ├── listener/
    │   └── listenerUtils.ts         # Intent handlers (decrypt → fulfill)
    ├── listenerService.ts            # Bridge event subscriptions
    ├── nonceManager.ts               # Per-chain nonce management
    ├── socket/
    │   └── socketEvents.ts          # Socket.IO event handlers
    ├── socketService.ts              # Socket.IO client setup
    ├── worker/
    │   ├── decrypt.worker.mjs       # Zama decryption worker
    │   ├── encrypt.worker.mjs       # Zama encryption worker
    │   ├── fhenix-decrypt.worker.cjs # Fhenix decryption worker
    │   └── fhenix-encrypt.worker.cjs # Fhenix encryption worker
    └── workerService.ts              # Worker thread orchestration
```

## License

[MIT](LICENSE)