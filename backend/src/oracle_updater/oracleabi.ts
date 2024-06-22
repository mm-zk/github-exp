export const oracleAbi = [
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
                        "internalType": "uint128",
                        "name": "author",
                        "type": "uint128"
                    },
                    {
                        "internalType": "bool",
                        "name": "isMergedToMain",
                        "type": "bool"
                    },
                    {
                        "components": [
                            {
                                "internalType": "uint128",
                                "name": "reviewer",
                                "type": "uint128"
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
] as const;