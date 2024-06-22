export const BountyABI = [
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
        "internalType": "uint256",
        "name": "bountyId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "claimant",
        "type": "address"
      }
    ],
    "name": "BountyAborted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "bountyId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "repositoryName",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "pullRequestId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "receiverGithubUsername",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "erc20Token",
        "type": "address"
      }
    ],
    "name": "BountyAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "bountyId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "claimant",
        "type": "address"
      }
    ],
    "name": "BountyClaimed",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "bountyId",
        "type": "uint256"
      }
    ],
    "name": "abortBounty",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "repositoryName",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "pullRequestId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "receiverGithubUsername",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "erc20Token",
        "type": "address"
      },
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "abortTimestamp",
            "type": "uint256"
          },
          {
            "internalType": "enum ReceiverInvolvement",
            "name": "receiverInvolvement",
            "type": "uint8"
          },
          {
            "internalType": "uint64",
            "name": "degradationStartSeconds",
            "type": "uint64"
          },
          {
            "internalType": "uint64",
            "name": "degradationEndSeconds",
            "type": "uint64"
          }
        ],
        "internalType": "struct BountyConditions",
        "name": "conditions",
        "type": "tuple"
      }
    ],
    "name": "addBounty",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "bounties",
    "outputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "repositoryName",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "pullRequestId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "receiverNFTTokenId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "erc20Token",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "claimed",
        "type": "bool"
      },
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "abortTimestamp",
            "type": "uint256"
          },
          {
            "internalType": "enum ReceiverInvolvement",
            "name": "receiverInvolvement",
            "type": "uint8"
          },
          {
            "internalType": "uint64",
            "name": "degradationStartSeconds",
            "type": "uint64"
          },
          {
            "internalType": "uint64",
            "name": "degradationEndSeconds",
            "type": "uint64"
          }
        ],
        "internalType": "struct BountyConditions",
        "name": "conditions",
        "type": "tuple"
      },
      {
        "internalType": "uint64",
        "name": "previousBountyIndex",
        "type": "uint64"
      },
      {
        "internalType": "uint64",
        "name": "previousUserBountyIndex",
        "type": "uint64"
      },
      {
        "internalType": "uint64",
        "name": "bountyId",
        "type": "uint64"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "bountyId",
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
    "name": "claimBounty",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "devNFT",
    "outputs": [
      {
        "internalType": "contract ZKsyncDEVNFT",
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
        "internalType": "string",
        "name": "repositoryName",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "pullRequestId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "maxResults",
        "type": "uint256"
      }
    ],
    "name": "getBounties",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "sender",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "repositoryName",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "pullRequestId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "receiverNFTTokenId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "erc20Token",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "claimed",
            "type": "bool"
          },
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "abortTimestamp",
                "type": "uint256"
              },
              {
                "internalType": "enum ReceiverInvolvement",
                "name": "receiverInvolvement",
                "type": "uint8"
              },
              {
                "internalType": "uint64",
                "name": "degradationStartSeconds",
                "type": "uint64"
              },
              {
                "internalType": "uint64",
                "name": "degradationEndSeconds",
                "type": "uint64"
              }
            ],
            "internalType": "struct BountyConditions",
            "name": "conditions",
            "type": "tuple"
          },
          {
            "internalType": "uint64",
            "name": "previousBountyIndex",
            "type": "uint64"
          },
          {
            "internalType": "uint64",
            "name": "previousUserBountyIndex",
            "type": "uint64"
          },
          {
            "internalType": "uint64",
            "name": "bountyId",
            "type": "uint64"
          }
        ],
        "internalType": "struct CodeReviewBounties.Bounty[]",
        "name": "result",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "repositoryName",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "pullRequestId",
        "type": "uint256"
      }
    ],
    "name": "getBountiesCount",
    "outputs": [
      {
        "internalType": "uint64",
        "name": "result",
        "type": "uint64"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "bountyId",
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
    "name": "getBountyEstimate",
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
        "internalType": "string",
        "name": "githubUsername",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "maxResults",
        "type": "uint256"
      }
    ],
    "name": "getUserBounties",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "sender",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "repositoryName",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "pullRequestId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "receiverNFTTokenId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "erc20Token",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "claimed",
            "type": "bool"
          },
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "abortTimestamp",
                "type": "uint256"
              },
              {
                "internalType": "enum ReceiverInvolvement",
                "name": "receiverInvolvement",
                "type": "uint8"
              },
              {
                "internalType": "uint64",
                "name": "degradationStartSeconds",
                "type": "uint64"
              },
              {
                "internalType": "uint64",
                "name": "degradationEndSeconds",
                "type": "uint64"
              }
            ],
            "internalType": "struct BountyConditions",
            "name": "conditions",
            "type": "tuple"
          },
          {
            "internalType": "uint64",
            "name": "previousBountyIndex",
            "type": "uint64"
          },
          {
            "internalType": "uint64",
            "name": "previousUserBountyIndex",
            "type": "uint64"
          },
          {
            "internalType": "uint64",
            "name": "bountyId",
            "type": "uint64"
          }
        ],
        "internalType": "struct CodeReviewBounties.Bounty[]",
        "name": "result",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "githubUsername",
        "type": "string"
      }
    ],
    "name": "getUserBountiesCount",
    "outputs": [
      {
        "internalType": "uint64",
        "name": "result",
        "type": "uint64"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "gitHubOracle",
    "outputs": [
      {
        "internalType": "contract IGitHubOracle",
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
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "latestBounty",
    "outputs": [
      {
        "internalType": "uint64",
        "name": "",
        "type": "uint64"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "latestUserBounty",
    "outputs": [
      {
        "internalType": "uint64",
        "name": "",
        "type": "uint64"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "numBounties",
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
        "internalType": "address",
        "name": "devNFTAddress",
        "type": "address"
      }
    ],
    "name": "setDevNFT",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "oracleAddress",
        "type": "address"
      }
    ],
    "name": "setGitHubOracleAddress",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;
