export const BountyABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "bountyId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "repositoryName",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "pullRequestId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "receiver",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "erc20Token",
        type: "address",
      },
    ],
    name: "BountyAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "bountyId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "claimant",
        type: "address",
      },
    ],
    name: "BountyClaimed",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "repositoryName",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "pullRequestId",
        type: "uint256",
      },
      {
        internalType: "address payable",
        name: "receiver",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "erc20Token",
        type: "address",
      },
    ],
    name: "addBounty",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "bounties",
    outputs: [
      {
        internalType: "string",
        name: "repositoryName",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "pullRequestId",
        type: "uint256",
      },
      {
        internalType: "address payable",
        name: "receiver",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "erc20Token",
        type: "address",
      },
      {
        internalType: "bool",
        name: "claimed",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "bountyId",
        type: "uint256",
      },
      {
        components: [
          {
            internalType: "string",
            name: "author",
            type: "string",
          },
          {
            internalType: "string[]",
            name: "reviewers",
            type: "string[]",
          },
          {
            internalType: "bool",
            name: "is_merged",
            type: "bool",
          },
        ],
        internalType: "struct PRDetails",
        name: "details",
        type: "tuple",
      },
    ],
    name: "claimBounty",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "gitHubOracle",
    outputs: [
      {
        internalType: "contract IGitHubOracle",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
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
    inputs: [
      {
        internalType: "address",
        name: "oracleAddress",
        type: "address",
      },
    ],
    name: "setGitHubOracleAddress",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
