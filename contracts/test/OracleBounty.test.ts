import { expect } from 'chai';
import { Contract, Wallet } from "zksync-ethers";
import { getWallet, deployContract, LOCAL_RICH_WALLETS } from '../deploy/utils';
import * as ethers from "ethers";

describe("ReviewToken", function () {
    let oracleContract: Contract;
    let bountyContract: Contract;
    let tokenContract: Contract;
    let ownerWallet: Wallet;
    let userWallet: Wallet;
    let reviewerWallet: Wallet;

    before(async function () {
        ownerWallet = getWallet(LOCAL_RICH_WALLETS[0].privateKey);
        userWallet = getWallet(LOCAL_RICH_WALLETS[1].privateKey);
        reviewerWallet = getWallet(LOCAL_RICH_WALLETS[2].privateKey);


        oracleContract = await deployContract("GitHubOracle", [], { wallet: ownerWallet, silent: true });
        bountyContract = await deployContract("CodeReviewBounties", [], { wallet: ownerWallet, silent: true });
        tokenContract = await deployContract("ReviewToken", [], { wallet: ownerWallet, silent: true });

        await bountyContract.setGitHubOracleAddress(await oracleContract.getAddress()).then(tx => tx.wait());

        const tx = await tokenContract.transfer(userWallet.address, 100);
        await tx.wait();

    });
    it("Bounty and claim", async function () {
        const userBountyContract = new Contract(await bountyContract.getAddress(), bountyContract.interface, userWallet);
        const reviewerBountyContract = new Contract(await bountyContract.getAddress(), bountyContract.interface, reviewerWallet);
        const userTokenContract = new Contract(await tokenContract.getAddress(), tokenContract.interface, userWallet);
        await userTokenContract.approve(await bountyContract.getAddress(), 10).then(tx => tx.wait());
        // Create a bounty.
        await userBountyContract.addBounty(
            "repo1", 1, reviewerWallet.address, 10, tokenContract
        ).then(tx => tx.wait());

        expect(await tokenContract.balanceOf(userWallet.address)).to.be.equal(90);
        expect(await tokenContract.balanceOf(reviewerWallet.address)).to.be.equal(0);

        const details = {
            author: "author",
            reviewers: ["rev1"],
            is_merged: false
        };

        // This should fail with 'wrong sender'
        await expect(userBountyContract.claimBounty(
            0, details
        ).then(tx => tx.wait())).to.be.revertedWith("Only the designated receiver can claim the bounty");

        // This should fail with 'diff hash'
        await expect(reviewerBountyContract.claimBounty(
            0, details
        ).then(tx => tx.wait())).to.be.revertedWith("State hash differs");

        await oracleContract.updatePRState("repo1", 1, details).then(tx => tx.wait());
        await reviewerBountyContract.claimBounty(
            0, details
        ).then(tx => tx.wait());

        expect(await tokenContract.balanceOf(userWallet.address)).to.be.equal(90);
        expect(await tokenContract.balanceOf(reviewerWallet.address)).to.be.equal(10);

        await expect(reviewerBountyContract.claimBounty(
            0, details
        ).then(tx => tx.wait())).to.be.revertedWith("Bounty already claimed");
    });
});

