// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IPaymaster, ExecutionResult, PAYMASTER_VALIDATION_SUCCESS_MAGIC} from "@matterlabs/zksync-contracts/l2/system-contracts/interfaces/IPaymaster.sol";
import {TransactionHelper, Transaction} from "@matterlabs/zksync-contracts/l2/system-contracts/libraries/TransactionHelper.sol";
import "@matterlabs/zksync-contracts/l2/system-contracts/Constants.sol";

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

contract GitHubOracle is IGitHubOracle, IPaymaster {
    address public owner;
    mapping(address => bool) public authorizedUpdaters;

    modifier onlyBootloader() {
        require(
            msg.sender == BOOTLOADER_FORMAL_ADDRESS,
            "Only bootloader can call this method"
        );
        // Continue execution if called from the bootloader.
        _;
    }

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
    function requestPRUpdate(
        string calldata repository,
        uint256 prId
    ) public payable {
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

    // Paymaster will pay for any method call into this contract, assuming that
    // it comes from authorized user.
    function validateAndPayForPaymasterTransaction(
        bytes32,
        bytes32,
        Transaction calldata transaction
    )
        external
        payable
        onlyBootloader
        returns (bytes4 magic, bytes memory context)
    {
        require(
            address(uint160(transaction.to)) == address(this),
            "Will not pay for this transaction"
        );
        require(
            authorizedUpdaters[address(uint160(transaction.from))] == true,
            "Sender not authorized"
        );

        context = "";
        magic = PAYMASTER_VALIDATION_SUCCESS_MAGIC;
        uint256 requiredETH = transaction.gasLimit * transaction.maxFeePerGas;

        // The bootloader never returns any data, so it can safely be ignored here.
        (bool success, ) = payable(BOOTLOADER_FORMAL_ADDRESS).call{
            value: requiredETH
        }("");
        require(
            success,
            "Failed to transfer tx fee to the Bootloader. Paymaster balance might not be enough."
        );
    }

    function postTransaction(
        bytes calldata _context,
        Transaction calldata _transaction,
        bytes32,
        bytes32,
        ExecutionResult _txResult,
        uint256 _maxRefundedGas
    ) external payable override onlyBootloader {}

    receive() external payable {}
}
