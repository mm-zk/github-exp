import { expect } from 'chai';
import { Contract, Wallet, utils } from "zksync-ethers";
import { getWallet, deployContract, LOCAL_RICH_WALLETS, getProvider } from '../deploy/utils';
import { ethers } from "ethers";
import deploy from '../deploy/deploy';

describe("ReviewToken", function () {
    let oracleContract: Contract;
    let bountyContract: Contract;
    let tokenContract: Contract;
    let nftContract: Contract;
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
        nftContract = await deployContract("ZKsyncDevNFT", [], { wallet: ownerWallet, silent: true });

        await bountyContract.setGitHubOracleAddress(await oracleContract.getAddress()).then(tx => tx.wait());
        await bountyContract.setDevNFT(await nftContract.getAddress()).then(tx => tx.wait());

        // Mint the nft for the reviewer.
        await nftContract.mint(reviewerWallet.address, "reviewer").then(tx => tx.wait());

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
            "repo1", 1, "reviewer", 10, tokenContract
        ).then(tx => tx.wait());

        expect(await tokenContract.balanceOf(userWallet.address)).to.be.equal(90);
        expect(await tokenContract.balanceOf(reviewerWallet.address)).to.be.equal(0);

        let details = {
            author: 113,
            approvals: [{
                reviewer: 188,
                reviewerDuration: 0,
                authorDuration: 0,
            }
            ],
            isMergedToMain: false
        };

        // This should fail with 'wrong sender'
        await expect(userBountyContract.claimBounty(
            0, details
        ).then(tx => tx.wait())).to.be.revertedWith("Only the designated receiver can claim the bounty");

        // This should fail with 'diff hash'
        await expect(reviewerBountyContract.claimBounty(
            0, details
        ).then(tx => tx.wait())).to.be.revertedWith("State hash differs");

        await oracleContract.updatePRState("repo1", 1, 100, details).then(tx => tx.wait());

        await expect(reviewerBountyContract.claimBounty(
            0, details
        ).then(tx => tx.wait())).to.be.revertedWith("PR is not merged yet");

        details.isMergedToMain = true;

        await oracleContract.updatePRState("repo1", 1, 101, details).then(tx => tx.wait());

        await reviewerBountyContract.claimBounty(
            0, details
        ).then(tx => tx.wait());

        expect(await tokenContract.balanceOf(userWallet.address)).to.be.equal(90);
        expect(await tokenContract.balanceOf(reviewerWallet.address)).to.be.equal(10);

        await expect(reviewerBountyContract.claimBounty(
            0, details
        ).then(tx => tx.wait())).to.be.revertedWith("Bounty already claimed");
    });

    it("With Oracle paymaster", async function () {
        // Oracle update has no tokens, it will try to use the Oracle's paymaster to cover the costs.
        const oracleUpdater = getWallet(Wallet.createRandom().privateKey);

        const oracleUpdaterContract = new Contract(await oracleContract.getAddress(), oracleContract.interface, oracleUpdater);

        // Add permissions.
        await oracleContract.setAuthorization(oracleUpdater.address, true).then(tx => tx.wait());

        const userBountyContract = new Contract(await bountyContract.getAddress(), bountyContract.interface, userWallet);
        const reviewerBountyContract = new Contract(await bountyContract.getAddress(), bountyContract.interface, reviewerWallet);
        const userTokenContract = new Contract(await tokenContract.getAddress(), tokenContract.interface, userWallet);

        const reviewerOracleContract = new Contract(await oracleContract.getAddress(), oracleContract.interface, reviewerWallet);

        await userTokenContract.approve(await bountyContract.getAddress(), 8).then(tx => tx.wait());
        // Create a bounty.
        await userBountyContract.addBounty(
            "repo1", 3, "reviewer", 8, tokenContract
        ).then(tx => tx.wait());


        let details = {
            author: 113,
            approvals: [{
                reviewer: 188,
                reviewerDuration: 0,
                authorDuration: 0,
            }
            ],
            isMergedToMain: true
        };

        // This will fail, as the state is not updated yet.
        await expect(reviewerBountyContract.claimBounty(
            1, details
        ).then(tx => tx.wait())).to.be.revertedWith("State hash differs");


        // This will fail due to out of gas (as oracleUpdater has no tokens).
        await expect(oracleUpdaterContract.updatePRState("repo1", 3, 99, details).then(tx => tx.wait())).to.be.reverted;


        await reviewerOracleContract.requestPRUpdate("repo1", 3, {
            value: ethers.parseEther("0.01")
        }).then(tx => tx.wait());


        const balance = await getProvider().getBalance(await oracleContract.getAddress());
        const paymasterParams = utils.getPaymasterParams(await oracleContract.getAddress(), {
            type: "General",
            innerInput: new Uint8Array(),
        });

        // Now the state is updated.
        await oracleUpdaterContract.updatePRState("repo1", 3, 150, details, {
            value: 0,
            maxPriorityFeePerGas: 0n,
            maxFeePerGas: await getProvider().getGasPrice(),
            gasLimit: 10000000, // Example custom gas limit,
            customData: {
                gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
                paymasterParams
            }
        }).then(tx => tx.wait());

        // And now reviewer can get the bounty.

        expect(await tokenContract.balanceOf(reviewerWallet.address)).to.be.equal(10);
        await reviewerBountyContract.claimBounty(
            1, details
        ).then(tx => tx.wait());
        expect(await tokenContract.balanceOf(reviewerWallet.address)).to.be.equal(18);
    });


    it("Test Paymaster Oracle", async function () {
        await ownerWallet.transfer({ to: await oracleContract.getAddress(), amount: ethers.parseEther("1") }).then(tx => tx.wait());

        const oracleUpdater = getWallet(Wallet.createRandom().privateKey);

        const oracleUpdaterContract = new Contract(await oracleContract.getAddress(), oracleContract.interface, oracleUpdater);


        let details = {
            author: 113,
            approvals: [{
                reviewer: 188,
                reviewerDuration: 0,
                authorDuration: 0,
            }
            ],
            isMergedToMain: false
        };

        const paymasterParams = utils.getPaymasterParams(await oracleContract.getAddress(), {
            type: "General",
            innerInput: new Uint8Array(),
        });

        // Fail - as it is not authorized.
        await expect(oracleUpdaterContract.updatePRState("testoracle", 1, 180, details, {
            value: 0,
            maxPriorityFeePerGas: 0n,
            maxFeePerGas: await getProvider().getGasPrice(),
            gasLimit: 10000000, // Example custom gas limit,
            customData: {
                gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
                paymasterParams
            }
        }).then(tx => tx.wait())).to.be.reverted;

        // Add permissions.
        await oracleContract.setAuthorization(oracleUpdater.address, true).then(tx => tx.wait());

        await oracleUpdaterContract.updatePRState("testoracle", 1, 184, details, {
            value: 0,
            maxPriorityFeePerGas: 0n,
            maxFeePerGas: await getProvider().getGasPrice(),
            gasLimit: 10000000, // Example custom gas limit,
            customData: {
                gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
                paymasterParams
            }
        }).then(tx => tx.wait());

    });

    it("Bounty management", async function () {
        const tokenContract = await deployContract("ReviewToken", [], { wallet: ownerWallet, silent: true });
        await tokenContract.transfer(userWallet.address, 100).then(tx => tx.wait());


        const userBountyContract = new Contract(await bountyContract.getAddress(), bountyContract.interface, userWallet);

        const userTokenContract = new Contract(await tokenContract.getAddress(), tokenContract.interface, userWallet);
        await userTokenContract.approve(await bountyContract.getAddress(), 15).then(tx => tx.wait());
        // Create a bounty.
        await userBountyContract.addBounty(
            "repo5", 1, "reviewer", 1, tokenContract
        ).then(tx => tx.wait());
        expect(await userBountyContract.getBountiesCount("repo5", 1)).to.be.equal(1);



        await userBountyContract.addBounty(
            "repo5", 2, "reviewer", 2, tokenContract
        ).then(tx => tx.wait());

        await userBountyContract.addBounty(
            "repo5", 1, "reviewer", 3, tokenContract
        ).then(tx => tx.wait());


        await userBountyContract.addBounty(
            "repo6", 2, "reviewer", 4, tokenContract
        ).then(tx => tx.wait());

        await userBountyContract.addBounty(
            "repo5", 1, "reviewer", 5, tokenContract
        ).then(tx => tx.wait());


        expect(await userBountyContract.getBountiesCount("repo5", 1)).to.be.equal(3);
        expect(await userBountyContract.getBountiesCount("repo6", 2)).to.be.equal(1);
        expect(await userBountyContract.getBountiesCount("invalid", 2)).to.be.equal(0);
        expect(await userBountyContract.getBountiesCount("repo5", 2)).to.be.equal(1);

        const bounties5 = await userBountyContract.getBounties("repo5", 1, 4);

        // bounties will be sorted in reverse direction.
        // here we are comparing the rewards.
        expect(bounties5[0][3]).to.be.equal(5);
        expect(bounties5[1][3]).to.be.equal(3);
        expect(bounties5[2][3]).to.be.equal(1);
        // Last one should be empty, as there are only 3 bounties.
        expect(bounties5[3][3]).to.be.equal(0);

    });

});

