// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {PRDetails, IGitHubOracle} from "./GithubOracle.sol";

interface IERC20 {
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);
    function transfer(
        address recipient,
        uint256 amount
    ) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

interface ZKsyncDEVNFT {
    function ownerOf(uint256 tokenId) external view returns (address);
    function githubToToken(
        string calldata githubUsername
    ) external pure returns (uint256);
}

contract CodeReviewBounties {
    struct Bounty {
        string repositoryName;
        uint pullRequestId;
        uint256 receiverNFTTokenId;
        uint amount;
        address erc20Token;
        bool claimed;
        // index to the previous bounty for the same repo & pull id.
        // if 0 - then this is the first bounty of its type.
        // to access prevoius bounty: bounties[previousBountyIndex - 1]
        uint64 previousBountyIndex;
    }

    Bounty[] public bounties;
    mapping(uint256 => uint64) public latestBounty;

    IGitHubOracle public gitHubOracle;
    ZKsyncDEVNFT public devNFT;

    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    // Set the address of the GitHub Oracle
    function setGitHubOracleAddress(address oracleAddress) public onlyOwner {
        gitHubOracle = IGitHubOracle(oracleAddress);
    }

    // Set the address of the NFT.
    function setDevNFT(address devNFTAddress) public onlyOwner {
        devNFT = ZKsyncDEVNFT(devNFTAddress);
    }

    // Event to emit when a new bounty is added.
    event BountyAdded(
        uint bountyId,
        string repositoryName,
        uint pullRequestId,
        string receiverGithubUsername,
        uint amount,
        address erc20Token
    );

    // Event to emit when a bounty is claimed.
    event BountyClaimed(uint bountyId, address indexed claimant);

    // Add a new bounty
    function addBounty(
        string calldata repositoryName,
        uint pullRequestId,
        string calldata receiverGithubUsername,
        uint amount,
        address erc20Token
    ) public {
        require(
            IERC20(erc20Token).transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );

        uint256 mapKey = uint256(
            keccak256(abi.encode(repositoryName, pullRequestId))
        );
        uint64 previousBountyIndex = latestBounty[mapKey];

        uint256 receiverNFTTokenId = devNFT.githubToToken(
            receiverGithubUsername
        );

        bounties.push(
            Bounty({
                repositoryName: repositoryName,
                pullRequestId: pullRequestId,
                receiverNFTTokenId: receiverNFTTokenId,
                amount: amount,
                erc20Token: erc20Token,
                claimed: false,
                previousBountyIndex: previousBountyIndex
            })
        );

        uint bountyId = bounties.length - 1;
        // Update the map.
        latestBounty[mapKey] = uint64(bountyId + 1);

        emit BountyAdded(
            bountyId,
            repositoryName,
            pullRequestId,
            receiverGithubUsername,
            amount,
            erc20Token
        );
    }

    // Returns number of bounties for a given repo/pull request.
    function getBountiesCount(
        string calldata repositoryName,
        uint pullRequestId
    ) public view returns (uint64 result) {
        result = 0;
        uint256 mapKey = uint256(
            keccak256(abi.encode(repositoryName, pullRequestId))
        );
        uint64 previousBountyIndex = latestBounty[mapKey];
        while (previousBountyIndex != 0) {
            result += 1;
            previousBountyIndex = bounties[previousBountyIndex - 1]
                .previousBountyIndex;
        }
    }

    // Gets up to 'maxResults' bounties for a given repo / pull request.
    function getBounties(
        string calldata repositoryName,
        uint pullRequestId,
        uint maxResults
    ) public view returns (Bounty[] memory result) {
        result = new Bounty[](maxResults);
        uint index = 0;
        uint256 mapKey = uint256(
            keccak256(abi.encode(repositoryName, pullRequestId))
        );
        uint64 previousBountyIndex = latestBounty[mapKey];
        while (previousBountyIndex != 0 && index < maxResults) {
            result[index] = bounties[previousBountyIndex - 1];
            index += 1;
            previousBountyIndex = bounties[previousBountyIndex - 1]
                .previousBountyIndex;
        }
    }

    // Claim a bounty
    function claimBounty(uint bountyId, PRDetails calldata details) public {
        Bounty storage bounty = bounties[bountyId];
        require(!bounty.claimed, "Bounty already claimed");
        address nftOwner = devNFT.ownerOf(bounty.receiverNFTTokenId);
        require(uint160(nftOwner) != 0, "NFT not minted yet or burned");
        require(
            msg.sender == nftOwner,
            "Only the designated receiver can claim the bounty"
        );

        gitHubOracle.verifyPRDetails(
            bounty.repositoryName,
            bounty.pullRequestId,
            details
        );

        require(details.isMergedToMain, "PR is not merged yet");

        bounty.claimed = true;
        require(
            IERC20(bounty.erc20Token).transfer(nftOwner, bounty.amount),
            "Transfer failed"
        );
        emit BountyClaimed(bountyId, msg.sender);
    }
}
