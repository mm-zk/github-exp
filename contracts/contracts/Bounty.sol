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

enum ReceiverInvolvement {
    Any,
    Author,
    Reviewer
}

struct BountyConditions {
    // If bounty conditions are not met by this time, bounty can be reverted.
    uint256 abortTimestamp;
    // Conditions for the receiver.
    ReceiverInvolvement receiverInvolvement;
    // Reward degradation (only if receiver is Author or Reviewer).
    // Reward is computed as:
    //     time_taken_by_receiver - degradationStartSeconds

    // If receiver takes less that this many seconds, they will get 100%.
    uint64 degradationStartSeconds;
    // If they take more than this many seconds they will take 0 reward.
    uint64 degradationEndSeconds;
}

function validateConditions(BountyConditions calldata conditions) pure {
    require(
        conditions.degradationStartSeconds <= conditions.degradationEndSeconds,
        "wrong degratation boundaries"
    );
}

function computeRewardPercent(
    uint64 duration,
    uint64 start,
    uint64 end
) pure returns (uint64 percent) {
    if (duration <= start) {
        // max.
        return 100;
    }

    if (duration > end) {
        return 0;
    }

    uint128 x = uint128(duration - start) * 100;
    uint128 y = end - start;
    require(y > 0, "empty duration");

    return uint64(x / y);
}

function computeRewardPercentForBounty(
    BountyConditions storage conditions,
    PRDetails calldata details,
    uint256 reviewerTokenId
) view returns (uint64 percent) {
    // TOOD: verify the cast.
    uint128 reviewer = uint128(reviewerTokenId);

    if (conditions.receiverInvolvement == ReceiverInvolvement.Any) {
        // MAX.
        return 100;
    }
    if (conditions.receiverInvolvement == ReceiverInvolvement.Author) {
        uint64 maxAuthorDuration = 0;
        for (uint i = 0; i < details.approvals.length; i++) {
            if (details.approvals[i].authorDuration > maxAuthorDuration) {
                maxAuthorDuration = details.approvals[i].authorDuration;
            }
        }
        return
            computeRewardPercent(
                maxAuthorDuration,
                conditions.degradationStartSeconds,
                conditions.degradationEndSeconds
            );
    }
    // This condition means that the receiver was supposed to be a reviewer.
    for (uint i = 0; i < details.approvals.length; i++) {
        if (details.approvals[i].reviewer == reviewer) {
            return
                computeRewardPercent(
                    details.approvals[i].reviewerDuration,
                    conditions.degradationStartSeconds,
                    conditions.degradationEndSeconds
                );
        }
    }
    // But in this case, they didn't actually approve the PR - so no reward.
    return 0;
}

contract CodeReviewBounties {
    struct Bounty {
        address sender;
        string repositoryName;
        uint pullRequestId;
        uint256 receiverNFTTokenId;
        uint amount;
        address erc20Token;
        bool claimed;
        BountyConditions conditions;
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
    event BountyAborted(uint bountyId, address indexed claimant);

    // Add a new bounty
    function addBounty(
        string calldata repositoryName,
        uint pullRequestId,
        string calldata receiverGithubUsername,
        uint amount,
        address erc20Token,
        BountyConditions calldata conditions
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
                sender: msg.sender,
                repositoryName: repositoryName,
                pullRequestId: pullRequestId,
                receiverNFTTokenId: receiverNFTTokenId,
                amount: amount,
                erc20Token: erc20Token,
                claimed: false,
                conditions: conditions,
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

        uint64 percent = computeRewardPercentForBounty(
            bounty.conditions,
            details,
            bounty.receiverNFTTokenId
        );
        require(percent <= 100, "Percent incorrect");

        uint256 toTransfer = (bounty.amount * 100) / percent;
        require(toTransfer <= bounty.amount, "Invalid mul");
        uint256 toReturn = bounty.amount - toTransfer;

        require(
            IERC20(bounty.erc20Token).transfer(nftOwner, toTransfer),
            "Transfer failed"
        );
        if (toReturn > 0) {
            require(
                IERC20(bounty.erc20Token).transfer(bounty.sender, toReturn),
                "Transfer failed"
            );
        }
        emit BountyClaimed(bountyId, msg.sender);
    }

    function abortBounty(uint bountyId) public {
        Bounty storage bounty = bounties[bountyId];
        require(!bounty.claimed, "Bounty already claimed");
        require(
            bounty.conditions.abortTimestamp > block.timestamp,
            "Bounty not ready for abort yet"
        );
        bounty.claimed = true;
        require(
            IERC20(bounty.erc20Token).transfer(bounty.sender, bounty.amount),
            "Transfer failed"
        );
        emit BountyAborted(bountyId, msg.sender);
    }
}
