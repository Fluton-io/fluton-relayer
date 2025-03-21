const bridgeABI = [
  {
    "inputs": [
      {
        "internalType": "contract IWETH9",
        "name": "_wrappedNativeToken",
        "type": "address"
      },
      {
        "internalType": "contract IBCHandler",
        "name": "_ibcHandler",
        "type": "address"
      },
      {
        "internalType": "uint64",
        "name": "_timeout",
        "type": "uint64"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "ErrInfinitePacket",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ErrInvalidAck",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ErrNoChannel",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ErrNotIBC",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ErrNotImplemented",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ErrOnlyOneChannel",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "MsgValueDoesNotMatchInputAmount",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "OwnableInvalidOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "OwnableUnauthorizedAccount",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ReentrancyGuardReentrantCall",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "UnauthorizedRelayer",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [],
    "name": "Acknowledged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "sender",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "receiver",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "relayer",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "inputToken",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "outputToken",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "inputAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "outputAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "uint32",
            "name": "originChainId",
            "type": "uint32"
          },
          {
            "internalType": "uint32",
            "name": "destinationChainId",
            "type": "uint32"
          },
          {
            "internalType": "enum FilledStatus",
            "name": "filledStatus",
            "type": "uint8"
          }
        ],
        "indexed": false,
        "internalType": "struct Intent",
        "name": "intent",
        "type": "tuple"
      }
    ],
    "name": "IntentCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "sender",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "receiver",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "relayer",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "inputToken",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "outputToken",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "inputAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "outputAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "uint32",
            "name": "originChainId",
            "type": "uint32"
          },
          {
            "internalType": "uint32",
            "name": "destinationChainId",
            "type": "uint32"
          },
          {
            "internalType": "enum FilledStatus",
            "name": "filledStatus",
            "type": "uint8"
          }
        ],
        "indexed": false,
        "internalType": "struct Intent",
        "name": "intent",
        "type": "tuple"
      }
    ],
    "name": "IntentFulfilled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "sender",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "receiver",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "relayer",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "inputToken",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "outputToken",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "inputAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "outputAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "uint32",
            "name": "originChainId",
            "type": "uint32"
          },
          {
            "internalType": "uint32",
            "name": "destinationChainId",
            "type": "uint32"
          },
          {
            "internalType": "enum FilledStatus",
            "name": "filledStatus",
            "type": "uint8"
          }
        ],
        "indexed": false,
        "internalType": "struct Intent",
        "name": "intent",
        "type": "tuple"
      }
    ],
    "name": "IntentRepaid",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [],
    "name": "TimedOut",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "BRIDGE_TYPEHASH",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "DOMAIN_SEPARATOR",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "WETH",
    "outputs": [
      {
        "internalType": "contract IWETH9",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "receiver",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "relayer",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "inputToken",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "outputToken",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "inputAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "outputAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint32",
        "name": "destinationChainId",
        "type": "uint32"
      }
    ],
    "name": "bridge",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "sender",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "receiver",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "relayer",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "inputToken",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "outputToken",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "inputAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "outputAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint32",
            "name": "destinationChainId",
            "type": "uint32"
          },
          {
            "internalType": "bytes",
            "name": "signature",
            "type": "bytes"
          }
        ],
        "internalType": "struct BridgeParams",
        "name": "params",
        "type": "tuple"
      }
    ],
    "name": "bridgeWithPermit",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "intentId",
        "type": "uint256"
      }
    ],
    "name": "doesIntentExist",
    "outputs": [
      {
        "internalType": "bool",
        "name": "exists",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "fee",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "feeReceiver",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "sender",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "receiver",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "relayer",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "inputToken",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "outputToken",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "inputAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "outputAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "uint32",
            "name": "originChainId",
            "type": "uint32"
          },
          {
            "internalType": "uint32",
            "name": "destinationChainId",
            "type": "uint32"
          },
          {
            "internalType": "enum FilledStatus",
            "name": "filledStatus",
            "type": "uint8"
          }
        ],
        "internalType": "struct Intent",
        "name": "intent",
        "type": "tuple"
      }
    ],
    "name": "fulfill",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "ibcAddress",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "nonces",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "uint64",
            "name": "sequence",
            "type": "uint64"
          },
          {
            "internalType": "uint32",
            "name": "sourceChannel",
            "type": "uint32"
          },
          {
            "internalType": "uint32",
            "name": "destinationChannel",
            "type": "uint32"
          },
          {
            "internalType": "bytes",
            "name": "data",
            "type": "bytes"
          },
          {
            "internalType": "uint64",
            "name": "timeoutHeight",
            "type": "uint64"
          },
          {
            "internalType": "uint64",
            "name": "timeoutTimestamp",
            "type": "uint64"
          }
        ],
        "internalType": "struct IBCPacket",
        "name": "",
        "type": "tuple"
      },
      {
        "internalType": "bytes",
        "name": "acknowledgement",
        "type": "bytes"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "onAcknowledgementPacket",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint32",
        "name": "",
        "type": "uint32"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "onChanCloseConfirm",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint32",
        "name": "",
        "type": "uint32"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "onChanCloseInit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint32",
        "name": "channelId",
        "type": "uint32"
      },
      {
        "internalType": "uint32",
        "name": "",
        "type": "uint32"
      },
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "onChanOpenAck",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint32",
        "name": "channelId",
        "type": "uint32"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "onChanOpenConfirm",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "enum IBCChannelOrder",
        "name": "",
        "type": "uint8"
      },
      {
        "internalType": "uint32",
        "name": "",
        "type": "uint32"
      },
      {
        "internalType": "uint32",
        "name": "",
        "type": "uint32"
      },
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "onChanOpenInit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "enum IBCChannelOrder",
        "name": "",
        "type": "uint8"
      },
      {
        "internalType": "uint32",
        "name": "",
        "type": "uint32"
      },
      {
        "internalType": "uint32",
        "name": "",
        "type": "uint32"
      },
      {
        "internalType": "uint32",
        "name": "",
        "type": "uint32"
      },
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "onChanOpenTry",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "uint64",
            "name": "sequence",
            "type": "uint64"
          },
          {
            "internalType": "uint32",
            "name": "sourceChannel",
            "type": "uint32"
          },
          {
            "internalType": "uint32",
            "name": "destinationChannel",
            "type": "uint32"
          },
          {
            "internalType": "bytes",
            "name": "data",
            "type": "bytes"
          },
          {
            "internalType": "uint64",
            "name": "timeoutHeight",
            "type": "uint64"
          },
          {
            "internalType": "uint64",
            "name": "timeoutTimestamp",
            "type": "uint64"
          }
        ],
        "internalType": "struct IBCPacket",
        "name": "",
        "type": "tuple"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "bytes",
        "name": "",
        "type": "bytes"
      }
    ],
    "name": "onRecvIntentPacket",
    "outputs": [
      {
        "internalType": "bytes",
        "name": "",
        "type": "bytes"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "uint64",
            "name": "sequence",
            "type": "uint64"
          },
          {
            "internalType": "uint32",
            "name": "sourceChannel",
            "type": "uint32"
          },
          {
            "internalType": "uint32",
            "name": "destinationChannel",
            "type": "uint32"
          },
          {
            "internalType": "bytes",
            "name": "data",
            "type": "bytes"
          },
          {
            "internalType": "uint64",
            "name": "timeoutHeight",
            "type": "uint64"
          },
          {
            "internalType": "uint64",
            "name": "timeoutTimestamp",
            "type": "uint64"
          }
        ],
        "internalType": "struct IBCPacket",
        "name": "packet",
        "type": "tuple"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "bytes",
        "name": "",
        "type": "bytes"
      }
    ],
    "name": "onRecvPacket",
    "outputs": [
      {
        "internalType": "bytes",
        "name": "acknowledgement",
        "type": "bytes"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "uint64",
            "name": "sequence",
            "type": "uint64"
          },
          {
            "internalType": "uint32",
            "name": "sourceChannel",
            "type": "uint32"
          },
          {
            "internalType": "uint32",
            "name": "destinationChannel",
            "type": "uint32"
          },
          {
            "internalType": "bytes",
            "name": "data",
            "type": "bytes"
          },
          {
            "internalType": "uint64",
            "name": "timeoutHeight",
            "type": "uint64"
          },
          {
            "internalType": "uint64",
            "name": "timeoutTimestamp",
            "type": "uint64"
          }
        ],
        "internalType": "struct IBCPacket",
        "name": "",
        "type": "tuple"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "onTimeoutPacket",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_fee",
        "type": "uint256"
      }
    ],
    "name": "setFee",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_feeReceiver",
        "type": "address"
      }
    ],
    "name": "setFeeReceiver",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
] as const
// const ABI = [
//   {
//     inputs: [
//       { internalType: "contract IWETH9", name: "_wrappedNativeToken", type: "address" },
//       { internalType: "contract IBCHandler", name: "_ibcHandler", type: "address" },
//       { internalType: "uint64", name: "_timeout", type: "uint64" },
//     ],
//     stateMutability: "nonpayable",
//     type: "constructor",
//   },
//   { inputs: [], name: "ErrInfinitePacket", type: "error" },
//   { inputs: [], name: "ErrInvalidAck", type: "error" },
//   { inputs: [], name: "ErrNotIBC", type: "error" },
//   { inputs: [], name: "ErrNotImplemented", type: "error" },
//   { inputs: [], name: "ErrOnlyOneChannel", type: "error" },
//   { inputs: [], name: "MsgValueDoesNotMatchInputAmount", type: "error" },
//   { inputs: [{ internalType: "address", name: "owner", type: "address" }], name: "OwnableInvalidOwner", type: "error" },
//   {
//     inputs: [{ internalType: "address", name: "account", type: "address" }],
//     name: "OwnableUnauthorizedAccount",
//     type: "error",
//   },
//   { inputs: [], name: "UnauthorizedRelayer", type: "error" },
//   { anonymous: false, inputs: [], name: "Acknowledged", type: "event" },
//   {
//     anonymous: false,
//     inputs: [
//       {
//         components: [
//           { internalType: "address", name: "sender", type: "address" },
//           { internalType: "address", name: "receiver", type: "address" },
//           { internalType: "address", name: "relayer", type: "address" },
//           { internalType: "address", name: "inputToken", type: "address" },
//           { internalType: "address", name: "outputToken", type: "address" },
//           { internalType: "uint256", name: "inputAmount", type: "uint256" },
//           { internalType: "uint256", name: "outputAmount", type: "uint256" },
//           { internalType: "uint256", name: "id", type: "uint256" },
//           { internalType: "uint32", name: "originChainId", type: "uint32" },
//           { internalType: "uint32", name: "destinationChainId", type: "uint32" },
//           { internalType: "enum FilledStatus", name: "filledStatus", type: "uint8" },
//         ],
//         indexed: false,
//         internalType: "struct Intent",
//         name: "intent",
//         type: "tuple",
//       },
//     ],
//     name: "IntentCreated",
//     type: "event",
//   },
//   {
//     anonymous: false,
//     inputs: [
//       {
//         components: [
//           { internalType: "address", name: "sender", type: "address" },
//           { internalType: "address", name: "receiver", type: "address" },
//           { internalType: "address", name: "relayer", type: "address" },
//           { internalType: "address", name: "inputToken", type: "address" },
//           { internalType: "address", name: "outputToken", type: "address" },
//           { internalType: "uint256", name: "inputAmount", type: "uint256" },
//           { internalType: "uint256", name: "outputAmount", type: "uint256" },
//           { internalType: "uint256", name: "id", type: "uint256" },
//           { internalType: "uint32", name: "originChainId", type: "uint32" },
//           { internalType: "uint32", name: "destinationChainId", type: "uint32" },
//           { internalType: "enum FilledStatus", name: "filledStatus", type: "uint8" },
//         ],
//         indexed: false,
//         internalType: "struct Intent",
//         name: "intent",
//         type: "tuple",
//       },
//     ],
//     name: "IntentFulfilled",
//     type: "event",
//   },
//   {
//     anonymous: false,
//     inputs: [
//       {
//         components: [
//           { internalType: "address", name: "sender", type: "address" },
//           { internalType: "address", name: "receiver", type: "address" },
//           { internalType: "address", name: "relayer", type: "address" },
//           { internalType: "address", name: "inputToken", type: "address" },
//           { internalType: "address", name: "outputToken", type: "address" },
//           { internalType: "uint256", name: "inputAmount", type: "uint256" },
//           { internalType: "uint256", name: "outputAmount", type: "uint256" },
//           { internalType: "uint256", name: "id", type: "uint256" },
//           { internalType: "uint32", name: "originChainId", type: "uint32" },
//           { internalType: "uint32", name: "destinationChainId", type: "uint32" },
//           { internalType: "enum FilledStatus", name: "filledStatus", type: "uint8" },
//         ],
//         indexed: false,
//         internalType: "struct Intent",
//         name: "intent",
//         type: "tuple",
//       },
//     ],
//     name: "IntentRepaid",
//     type: "event",
//   },
//   {
//     anonymous: false,
//     inputs: [
//       { indexed: true, internalType: "address", name: "previousOwner", type: "address" },
//       { indexed: true, internalType: "address", name: "newOwner", type: "address" },
//     ],
//     name: "OwnershipTransferred",
//     type: "event",
//   },
//   { anonymous: false, inputs: [], name: "TimedOut", type: "event" },
//   {
//     inputs: [],
//     name: "WETH",
//     outputs: [{ internalType: "contract IWETH9", name: "", type: "address" }],
//     stateMutability: "view",
//     type: "function",
//   },
//   {
//     inputs: [
//       { internalType: "address", name: "sender", type: "address" },
//       { internalType: "address", name: "receiver", type: "address" },
//       { internalType: "address", name: "relayer", type: "address" },
//       { internalType: "address", name: "inputToken", type: "address" },
//       { internalType: "address", name: "outputToken", type: "address" },
//       { internalType: "uint256", name: "inputAmount", type: "uint256" },
//       { internalType: "uint256", name: "outputAmount", type: "uint256" },
//       { internalType: "uint32", name: "destinationChainId", type: "uint32" },
//     ],
//     name: "bridge",
//     outputs: [],
//     stateMutability: "payable",
//     type: "function",
//   },
//   {
//     inputs: [{ internalType: "uint256", name: "intentId", type: "uint256" }],
//     name: "doesIntentExist",
//     outputs: [{ internalType: "bool", name: "exists", type: "bool" }],
//     stateMutability: "view",
//     type: "function",
//   },
//   {
//     inputs: [],
//     name: "fee",
//     outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
//     stateMutability: "view",
//     type: "function",
//   },
//   {
//     inputs: [],
//     name: "feeReceiver",
//     outputs: [{ internalType: "address", name: "", type: "address" }],
//     stateMutability: "view",
//     type: "function",
//   },
//   {
//     inputs: [
//       {
//         components: [
//           { internalType: "address", name: "sender", type: "address" },
//           { internalType: "address", name: "receiver", type: "address" },
//           { internalType: "address", name: "relayer", type: "address" },
//           { internalType: "address", name: "inputToken", type: "address" },
//           { internalType: "address", name: "outputToken", type: "address" },
//           { internalType: "uint256", name: "inputAmount", type: "uint256" },
//           { internalType: "uint256", name: "outputAmount", type: "uint256" },
//           { internalType: "uint256", name: "id", type: "uint256" },
//           { internalType: "uint32", name: "originChainId", type: "uint32" },
//           { internalType: "uint32", name: "destinationChainId", type: "uint32" },
//           { internalType: "enum FilledStatus", name: "filledStatus", type: "uint8" },
//         ],
//         internalType: "struct Intent",
//         name: "intent",
//         type: "tuple",
//       },
//     ],
//     name: "fulfill",
//     outputs: [],
//     stateMutability: "payable",
//     type: "function",
//   },
//   {
//     inputs: [],
//     name: "ibcAddress",
//     outputs: [{ internalType: "address", name: "", type: "address" }],
//     stateMutability: "view",
//     type: "function",
//   },
//   {
//     inputs: [
//       {
//         components: [
//           { internalType: "uint64", name: "sequence", type: "uint64" },
//           { internalType: "uint32", name: "sourceChannel", type: "uint32" },
//           { internalType: "uint32", name: "destinationChannel", type: "uint32" },
//           { internalType: "bytes", name: "data", type: "bytes" },
//           { internalType: "uint64", name: "timeoutHeight", type: "uint64" },
//           { internalType: "uint64", name: "timeoutTimestamp", type: "uint64" },
//         ],
//         internalType: "struct IBCPacket",
//         name: "",
//         type: "tuple",
//       },
//       { internalType: "bytes", name: "acknowledgement", type: "bytes" },
//       { internalType: "address", name: "", type: "address" },
//     ],
//     name: "onAcknowledgementPacket",
//     outputs: [],
//     stateMutability: "nonpayable",
//     type: "function",
//   },
//   {
//     inputs: [
//       { internalType: "uint32", name: "", type: "uint32" },
//       { internalType: "address", name: "", type: "address" },
//     ],
//     name: "onChanCloseConfirm",
//     outputs: [],
//     stateMutability: "nonpayable",
//     type: "function",
//   },
//   {
//     inputs: [
//       { internalType: "uint32", name: "", type: "uint32" },
//       { internalType: "address", name: "", type: "address" },
//     ],
//     name: "onChanCloseInit",
//     outputs: [],
//     stateMutability: "nonpayable",
//     type: "function",
//   },
//   {
//     inputs: [
//       { internalType: "uint32", name: "channelId", type: "uint32" },
//       { internalType: "uint32", name: "", type: "uint32" },
//       { internalType: "string", name: "", type: "string" },
//       { internalType: "address", name: "", type: "address" },
//     ],
//     name: "onChanOpenAck",
//     outputs: [],
//     stateMutability: "nonpayable",
//     type: "function",
//   },
//   {
//     inputs: [
//       { internalType: "uint32", name: "channelId", type: "uint32" },
//       { internalType: "address", name: "", type: "address" },
//     ],
//     name: "onChanOpenConfirm",
//     outputs: [],
//     stateMutability: "nonpayable",
//     type: "function",
//   },
//   {
//     inputs: [
//       { internalType: "enum IBCChannelOrder", name: "", type: "uint8" },
//       { internalType: "uint32", name: "", type: "uint32" },
//       { internalType: "uint32", name: "", type: "uint32" },
//       { internalType: "string", name: "", type: "string" },
//       { internalType: "address", name: "", type: "address" },
//     ],
//     name: "onChanOpenInit",
//     outputs: [],
//     stateMutability: "nonpayable",
//     type: "function",
//   },
//   {
//     inputs: [
//       { internalType: "enum IBCChannelOrder", name: "", type: "uint8" },
//       { internalType: "uint32", name: "", type: "uint32" },
//       { internalType: "uint32", name: "", type: "uint32" },
//       { internalType: "uint32", name: "", type: "uint32" },
//       { internalType: "string", name: "", type: "string" },
//       { internalType: "string", name: "", type: "string" },
//       { internalType: "address", name: "", type: "address" },
//     ],
//     name: "onChanOpenTry",
//     outputs: [],
//     stateMutability: "nonpayable",
//     type: "function",
//   },
//   {
//     inputs: [
//       {
//         components: [
//           { internalType: "uint64", name: "sequence", type: "uint64" },
//           { internalType: "uint32", name: "sourceChannel", type: "uint32" },
//           { internalType: "uint32", name: "destinationChannel", type: "uint32" },
//           { internalType: "bytes", name: "data", type: "bytes" },
//           { internalType: "uint64", name: "timeoutHeight", type: "uint64" },
//           { internalType: "uint64", name: "timeoutTimestamp", type: "uint64" },
//         ],
//         internalType: "struct IBCPacket",
//         name: "",
//         type: "tuple",
//       },
//       { internalType: "address", name: "", type: "address" },
//       { internalType: "bytes", name: "", type: "bytes" },
//     ],
//     name: "onRecvIntentPacket",
//     outputs: [{ internalType: "bytes", name: "", type: "bytes" }],
//     stateMutability: "nonpayable",
//     type: "function",
//   },
//   {
//     inputs: [
//       {
//         components: [
//           { internalType: "uint64", name: "sequence", type: "uint64" },
//           { internalType: "uint32", name: "sourceChannel", type: "uint32" },
//           { internalType: "uint32", name: "destinationChannel", type: "uint32" },
//           { internalType: "bytes", name: "data", type: "bytes" },
//           { internalType: "uint64", name: "timeoutHeight", type: "uint64" },
//           { internalType: "uint64", name: "timeoutTimestamp", type: "uint64" },
//         ],
//         internalType: "struct IBCPacket",
//         name: "packet",
//         type: "tuple",
//       },
//       { internalType: "address", name: "", type: "address" },
//       { internalType: "bytes", name: "", type: "bytes" },
//     ],
//     name: "onRecvPacket",
//     outputs: [{ internalType: "bytes", name: "acknowledgement", type: "bytes" }],
//     stateMutability: "nonpayable",
//     type: "function",
//   },
//   {
//     inputs: [
//       {
//         components: [
//           { internalType: "uint64", name: "sequence", type: "uint64" },
//           { internalType: "uint32", name: "sourceChannel", type: "uint32" },
//           { internalType: "uint32", name: "destinationChannel", type: "uint32" },
//           { internalType: "bytes", name: "data", type: "bytes" },
//           { internalType: "uint64", name: "timeoutHeight", type: "uint64" },
//           { internalType: "uint64", name: "timeoutTimestamp", type: "uint64" },
//         ],
//         internalType: "struct IBCPacket",
//         name: "",
//         type: "tuple",
//       },
//       { internalType: "address", name: "", type: "address" },
//     ],
//     name: "onTimeoutPacket",
//     outputs: [],
//     stateMutability: "nonpayable",
//     type: "function",
//   },
//   {
//     inputs: [],
//     name: "owner",
//     outputs: [{ internalType: "address", name: "", type: "address" }],
//     stateMutability: "view",
//     type: "function",
//   },
//   { inputs: [], name: "renounceOwnership", outputs: [], stateMutability: "nonpayable", type: "function" },
//   {
//     inputs: [{ internalType: "uint256", name: "_fee", type: "uint256" }],
//     name: "setFee",
//     outputs: [],
//     stateMutability: "nonpayable",
//     type: "function",
//   },
//   {
//     inputs: [{ internalType: "address", name: "_feeReceiver", type: "address" }],
//     name: "setFeeReceiver",
//     outputs: [],
//     stateMutability: "nonpayable",
//     type: "function",
//   },
//   {
//     inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
//     name: "transferOwnership",
//     outputs: [],
//     stateMutability: "nonpayable",
//     type: "function",
//   },
//   { stateMutability: "payable", type: "receive" },
// ] as const;

export default bridgeABI;
