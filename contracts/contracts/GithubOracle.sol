// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IPaymaster, ExecutionResult, PAYMASTER_VALIDATION_SUCCESS_MAGIC} from "@matterlabs/zksync-contracts/l2/system-contracts/interfaces/IPaymaster.sol";
import {TransactionHelper, Transaction} from "@matterlabs/zksync-contracts/l2/system-contracts/libraries/TransactionHelper.sol";
import "@matterlabs/zksync-contracts/l2/system-contracts/Constants.sol";

// Reviewer that approved the pr.
struct ApprovedReviewer {
    // Reviewer.
    string reviewer;
    // Time that reviewer took (in milliseconds).
    uint64 reviewerDuration;
    // Time that author spent (in milliseconds).
    uint64 authorDuration;
}

struct PRDetails {
    // Author.
    string author;
    // Whether the PR is merged into main branch.
    bool isMergedToMain;
    // Reviewers that approved it.
    ApprovedReviewer[] approvals;
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
    mapping(bytes32 => bytes32) public prStates;

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

    // Packs the hash of the details into the 192 bits, and timestamp into remaining 64 bits.
    function hashAndPack(
        PRDetails calldata details,
        uint64 timestamp
    ) internal pure returns (bytes32) {
        // Compute the Keccak-256 hash of the struct
        bytes32 structHash = keccak256(abi.encode(details));

        // Extract the first 192 bits (24 bytes) of the hash
        bytes24 truncatedHash = bytes24(structHash);

        // Pack the truncated hash and the timestamp into a 32-byte array
        bytes32 packedData = bytes32(truncatedHash) |
            (bytes32(uint256(timestamp)));

        return packedData;
    }

    // Authorized updaters can submit PR state
    function updatePRState(
        string calldata repository,
        uint256 prId,
        uint64 updateTimestamp,
        PRDetails calldata details
    ) public onlyAuthorized {
        bytes32 stateHash = hashAndPack(details, updateTimestamp);
        prStates[keccak256(abi.encodePacked(repository, prId))] = stateHash;
        emit PRStateUpdated(repository, prId, stateHash);
    }

    function verifyPRDetails(
        string calldata repository,
        uint256 prId,
        PRDetails calldata details
    ) public view {
        // Compare hashes which are in the 24 bytes, ignoring the timestamp part.
        bytes24 stateHash = bytes24(keccak256(abi.encode(details)));
        bytes24 existingHash = bytes24(
            prStates[keccak256(abi.encodePacked(repository, prId))]
        );
        require(existingHash == stateHash, "State hash differs");
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
