const abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  {
    inputs: [],
    name: "UnauthorizedRelayer",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "sender",
            type: "address",
          },
          {
            internalType: "address",
            name: "receiver",
            type: "address",
          },
          {
            internalType: "address",
            name: "relayer",
            type: "address",
          },
          {
            internalType: "address",
            name: "inputToken",
            type: "address",
          },
          {
            internalType: "address",
            name: "outputToken",
            type: "address",
          },
          {
            internalType: "euint64",
            name: "inputAmount",
            type: "bytes32",
          },
          {
            internalType: "euint64",
            name: "outputAmount",
            type: "bytes32",
          },
          {
            internalType: "uint256",
            name: "id",
            type: "uint256",
          },
          {
            internalType: "uint32",
            name: "originChainId",
            type: "uint32",
          },
          {
            internalType: "uint32",
            name: "destinationChainId",
            type: "uint32",
          },
          {
            internalType: "enum FHEVMBridge.FilledStatus",
            name: "filledStatus",
            type: "uint8",
          },
        ],
        indexed: false,
        internalType: "struct FHEVMBridge.Intent",
        name: "intent",
        type: "tuple",
      },
    ],
    name: "IntentCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "sender",
            type: "address",
          },
          {
            internalType: "address",
            name: "receiver",
            type: "address",
          },
          {
            internalType: "address",
            name: "relayer",
            type: "address",
          },
          {
            internalType: "address",
            name: "inputToken",
            type: "address",
          },
          {
            internalType: "address",
            name: "outputToken",
            type: "address",
          },
          {
            internalType: "euint64",
            name: "inputAmount",
            type: "bytes32",
          },
          {
            internalType: "euint64",
            name: "outputAmount",
            type: "bytes32",
          },
          {
            internalType: "uint256",
            name: "id",
            type: "uint256",
          },
          {
            internalType: "uint32",
            name: "originChainId",
            type: "uint32",
          },
          {
            internalType: "uint32",
            name: "destinationChainId",
            type: "uint32",
          },
          {
            internalType: "enum FHEVMBridge.FilledStatus",
            name: "filledStatus",
            type: "uint8",
          },
        ],
        indexed: false,
        internalType: "struct FHEVMBridge.Intent",
        name: "intent",
        type: "tuple",
      },
    ],
    name: "IntentFulfilled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "sender",
            type: "address",
          },
          {
            internalType: "address",
            name: "receiver",
            type: "address",
          },
          {
            internalType: "address",
            name: "relayer",
            type: "address",
          },
          {
            internalType: "address",
            name: "inputToken",
            type: "address",
          },
          {
            internalType: "address",
            name: "outputToken",
            type: "address",
          },
          {
            internalType: "euint64",
            name: "inputAmount",
            type: "bytes32",
          },
          {
            internalType: "euint64",
            name: "outputAmount",
            type: "bytes32",
          },
          {
            internalType: "uint256",
            name: "id",
            type: "uint256",
          },
          {
            internalType: "uint32",
            name: "originChainId",
            type: "uint32",
          },
          {
            internalType: "uint32",
            name: "destinationChainId",
            type: "uint32",
          },
          {
            internalType: "enum FHEVMBridge.FilledStatus",
            name: "filledStatus",
            type: "uint8",
          },
        ],
        indexed: false,
        internalType: "struct FHEVMBridge.Intent",
        name: "intent",
        type: "tuple",
      },
    ],
    name: "IntentRepaid",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferStarted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    inputs: [],
    name: "acceptOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_sender",
        type: "address",
      },
      {
        internalType: "address",
        name: "_receiver",
        type: "address",
      },
      {
        internalType: "address",
        name: "_relayer",
        type: "address",
      },
      {
        internalType: "address",
        name: "_inputToken",
        type: "address",
      },
      {
        internalType: "address",
        name: "_outputToken",
        type: "address",
      },
      {
        internalType: "externalEuint64",
        name: "_encInputAmount",
        type: "bytes32",
      },
      {
        internalType: "externalEuint64",
        name: "_encOutputAmount",
        type: "bytes32",
      },
      {
        internalType: "uint32",
        name: "_destinationChainId",
        type: "uint32",
      },
      {
        internalType: "bytes",
        name: "_inputProof",
        type: "bytes",
      },
    ],
    name: "bridge",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "intentId",
        type: "uint256",
      },
    ],
    name: "doesIntentExist",
    outputs: [
      {
        internalType: "bool",
        name: "exists",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "fee",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "feeReceiver",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "sender",
            type: "address",
          },
          {
            internalType: "address",
            name: "receiver",
            type: "address",
          },
          {
            internalType: "address",
            name: "relayer",
            type: "address",
          },
          {
            internalType: "address",
            name: "inputToken",
            type: "address",
          },
          {
            internalType: "address",
            name: "outputToken",
            type: "address",
          },
          {
            internalType: "euint64",
            name: "inputAmount",
            type: "bytes32",
          },
          {
            internalType: "euint64",
            name: "outputAmount",
            type: "bytes32",
          },
          {
            internalType: "uint256",
            name: "id",
            type: "uint256",
          },
          {
            internalType: "uint32",
            name: "originChainId",
            type: "uint32",
          },
          {
            internalType: "uint32",
            name: "destinationChainId",
            type: "uint32",
          },
          {
            internalType: "enum FHEVMBridge.FilledStatus",
            name: "filledStatus",
            type: "uint8",
          },
        ],
        internalType: "struct FHEVMBridge.Intent",
        name: "intent",
        type: "tuple",
      },
      {
        internalType: "externalEuint64",
        name: "_outputAmount",
        type: "bytes32",
      },
      {
        internalType: "bytes",
        name: "_inputProof",
        type: "bytes",
      },
    ],
    name: "fulfill",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "pendingOwner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "tokenAddress",
        type: "address",
      },
      {
        internalType: "externalEuint64",
        name: "_encryptedAmount",
        type: "bytes32",
      },
      {
        internalType: "bytes",
        name: "_inputProof",
        type: "bytes",
      },
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export default abi;
