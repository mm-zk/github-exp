// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

struct PRDetails {
    string author;
    string[] reviewers;
    bool is_merged;
}

interface IGitHubOracle {
    function verifyPRDetails(
        string calldata repository,
        uint256 prId,
        PRDetails calldata details
    ) external view;
}

contract GitHubOracle is IGitHubOracle {
    address public owner;
    mapping(address => bool) public authorizedUpdaters;

    // Mapping to store keccak hash of PR details by repo and PR ID
    mapping(string => mapping(uint256 => bytes32)) public prStates;

    // Events
    event PRUpdateRequested(string repository, uint256 prId);
    event PRStateUpdated(string repository, uint256 prId, bytes32 stateHash);

    constructor() {
        owner = msg.sender;
        setAuthorization(owner, true);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier onlyAuthorized() {
        require(authorizedUpdaters[msg.sender], "Unauthorized");
        _;
    }

    // Add or remove authorized updaters
    function setAuthorization(
        address updater,
        bool authorized
    ) public onlyOwner {
        authorizedUpdaters[updater] = authorized;
    }

    // Users can request updates for a PR
    function requestPRUpdate(string calldata repository, uint256 prId) public {
        emit PRUpdateRequested(repository, prId);
    }

    // Authorized updaters can submit PR state
    function updatePRState(
        string calldata repository,
        uint256 prId,
        PRDetails calldata details
    ) public onlyAuthorized {
        bytes32 stateHash = keccak256(abi.encode(details));
        prStates[repository][prId] = stateHash;
        emit PRStateUpdated(repository, prId, stateHash);
    }

    function verifyPRDetails(
        string calldata repository,
        uint256 prId,
        PRDetails calldata details
    ) public view {
        bytes32 stateHash = keccak256(abi.encode(details));
        require(prStates[repository][prId] == stateHash, "State hash differs");
    }
}
