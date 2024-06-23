export const OracleABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "repository",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "prId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "stateHash",
        "type": "bytes32"
      }
    ],
    "name": "PRStateUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "repository",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "prId",
        "type": "uint256"
      }
    ],
    "name": "PRUpdateRequested",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "authorizedUpdaters",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
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
    "inputs": [
      {
        "internalType": "bytes",
        "name": "_context",
        "type": "bytes"
      },
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "txType",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "from",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "to",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "gasLimit",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "gasPerPubdataByteLimit",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "maxFeePerGas",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "maxPriorityFeePerGas",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "paymaster",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "nonce",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          },
          {
            "internalType": "uint256[4]",
            "name": "reserved",
            "type": "uint256[4]"
          },
          {
            "internalType": "bytes",
            "name": "data",
            "type": "bytes"
          },
          {
            "internalType": "bytes",
            "name": "signature",
            "type": "bytes"
          },
          {
            "internalType": "bytes32[]",
            "name": "factoryDeps",
            "type": "bytes32[]"
          },
          {
            "internalType": "bytes",
            "name": "paymasterInput",
            "type": "bytes"
          },
          {
            "internalType": "bytes",
            "name": "reservedDynamic",
            "type": "bytes"
          }
        ],
        "internalType": "struct Transaction",
        "name": "_transaction",
        "type": "tuple"
      },
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      },
      {
        "internalType": "enum ExecutionResult",
        "name": "_txResult",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "_maxRefundedGas",
        "type": "uint256"
      }
    ],
    "name": "postTransaction",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "prStates",
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
    "inputs": [
      {
        "internalType": "string",
        "name": "repository",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "prId",
        "type": "uint256"
      }
    ],
    "name": "requestPRUpdate",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "updater",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "authorized",
        "type": "bool"
      }
    ],
    "name": "setAuthorization",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "repository",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "prId",
        "type": "uint256"
      },
      {
        "internalType": "uint64",
        "name": "updateTimestamp",
        "type": "uint64"
      },
      {
        "components": [
          {
            "internalType": "string",
            "name": "author",
            "type": "string"
          },
          {
            "internalType": "bool",
            "name": "isMergedToMain",
            "type": "bool"
          },
          {
            "components": [
              {
                "internalType": "string",
                "name": "reviewer",
                "type": "string"
              },
              {
                "internalType": "uint64",
                "name": "reviewerDuration",
                "type": "uint64"
              },
              {
                "internalType": "uint64",
                "name": "authorDuration",
                "type": "uint64"
              }
            ],
            "internalType": "struct ApprovedReviewer[]",
            "name": "approvals",
            "type": "tuple[]"
          }
        ],
        "internalType": "struct PRDetails",
        "name": "details",
        "type": "tuple"
      }
    ],
    "name": "updatePRState",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      },
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "txType",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "from",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "to",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "gasLimit",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "gasPerPubdataByteLimit",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "maxFeePerGas",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "maxPriorityFeePerGas",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "paymaster",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "nonce",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          },
          {
            "internalType": "uint256[4]",
            "name": "reserved",
            "type": "uint256[4]"
          },
          {
            "internalType": "bytes",
            "name": "data",
            "type": "bytes"
          },
          {
            "internalType": "bytes",
            "name": "signature",
            "type": "bytes"
          },
          {
            "internalType": "bytes32[]",
            "name": "factoryDeps",
            "type": "bytes32[]"
          },
          {
            "internalType": "bytes",
            "name": "paymasterInput",
            "type": "bytes"
          },
          {
            "internalType": "bytes",
            "name": "reservedDynamic",
            "type": "bytes"
          }
        ],
        "internalType": "struct Transaction",
        "name": "transaction",
        "type": "tuple"
      }
    ],
    "name": "validateAndPayForPaymasterTransaction",
    "outputs": [
      {
        "internalType": "bytes4",
        "name": "magic",
        "type": "bytes4"
      },
      {
        "internalType": "bytes",
        "name": "context",
        "type": "bytes"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "repository",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "prId",
        "type": "uint256"
      },
      {
        "components": [
          {
            "internalType": "string",
            "name": "author",
            "type": "string"
          },
          {
            "internalType": "bool",
            "name": "isMergedToMain",
            "type": "bool"
          },
          {
            "components": [
              {
                "internalType": "string",
                "name": "reviewer",
                "type": "string"
              },
              {
                "internalType": "uint64",
                "name": "reviewerDuration",
                "type": "uint64"
              },
              {
                "internalType": "uint64",
                "name": "authorDuration",
                "type": "uint64"
              }
            ],
            "internalType": "struct ApprovedReviewer[]",
            "name": "approvals",
            "type": "tuple[]"
          }
        ],
        "internalType": "struct PRDetails",
        "name": "details",
        "type": "tuple"
      }
    ],
    "name": "verifyPRDetails",
    "outputs": [],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
] as const;
