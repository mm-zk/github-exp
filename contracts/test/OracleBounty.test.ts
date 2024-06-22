import { expect } from 'chai';
import { Contract, Wallet, utils } from "zksync-ethers";
import { getWallet, deployContract, LOCAL_RICH_WALLETS, getProvider } from '../deploy/utils';
import { AbiCoder, ethers, keccak256, toUtf8Bytes } from "ethers";
import deploy from '../deploy/deploy';

describe("OracleBounty", function () {
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
        let conditions = {
            abortTimestamp: 0,
            receiverInvolvement: 0,
            degradationStartSeconds: 0,
            degradationEndSeconds: 0,
        }
        await userBountyContract.addBounty(
            "repo1", 1, "reviewer", 10, tokenContract, conditions
        ).then(tx => tx.wait());

        expect(await tokenContract.balanceOf(userWallet.address)).to.be.equal(90);
        expect(await tokenContract.balanceOf(reviewerWallet.address)).to.be.equal(0);

        let details = {
            author: "auth",
            approvals: [{
                reviewer: "revi",
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
        let conditions = {
            abortTimestamp: 0,
            receiverInvolvement: 0,
            degradationStartSeconds: 0,
            degradationEndSeconds: 0,
        }
        await userBountyContract.addBounty(
            "repo1", 3, "reviewer", 8, tokenContract, conditions
        ).then(tx => tx.wait());


        let details = {
            author: "auth",
            approvals: [{
                reviewer: "revi",
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
            author: "auth",
            approvals: [{
                reviewer: "revi",
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
        let conditions = {
            abortTimestamp: 0,
            receiverInvolvement: 0,
            degradationStartSeconds: 0,
            degradationEndSeconds: 0,
        }
        const tokenContract = await deployContract("ReviewToken", [], { wallet: ownerWallet, silent: true });
        await tokenContract.transfer(userWallet.address, 100).then(tx => tx.wait());


        const userBountyContract = new Contract(await bountyContract.getAddress(), bountyContract.interface, userWallet);

        const userTokenContract = new Contract(await tokenContract.getAddress(), tokenContract.interface, userWallet);
        await userTokenContract.approve(await bountyContract.getAddress(), 15).then(tx => tx.wait());
        // Create a bounty.
        await userBountyContract.addBounty(
            "repo5", 1, "local_reviewer", 1, tokenContract, conditions
        ).then(tx => tx.wait());
        expect(await userBountyContract.getBountiesCount("repo5", 1)).to.be.equal(1);
        expect(await userBountyContract.getUserBountiesCount("local_reviewer")).to.be.equal(1);
        expect(await userBountyContract.getUserBountiesCount("otherUser")).to.be.equal(0);



        await userBountyContract.addBounty(
            "repo5", 2, "local_reviewer1", 2, tokenContract, conditions
        ).then(tx => tx.wait());

        await userBountyContract.addBounty(
            "repo5", 1, "local_reviewer1", 3, tokenContract, conditions
        ).then(tx => tx.wait());


        await userBountyContract.addBounty(
            "repo6", 2, "local_reviewer", 4, tokenContract, conditions
        ).then(tx => tx.wait());

        await userBountyContract.addBounty(
            "repo5", 1, "local_reviewer", 5, tokenContract, conditions
        ).then(tx => tx.wait());

        expect(await userBountyContract.getUserBountiesCount("local_reviewer")).to.be.equal(3);
        expect(await userBountyContract.getUserBountiesCount("local_reviewer1")).to.be.equal(2);


        expect(await userBountyContract.getBountiesCount("repo5", 1)).to.be.equal(3);
        expect(await userBountyContract.getBountiesCount("repo6", 2)).to.be.equal(1);
        expect(await userBountyContract.getBountiesCount("invalid", 2)).to.be.equal(0);
        expect(await userBountyContract.getBountiesCount("repo5", 2)).to.be.equal(1);

        const bounties5 = await userBountyContract.getBounties("repo5", 1, 4);
        // bounties will be sorted in reverse direction.
        // here we are comparing the rewards.
        expect(bounties5[0][4]).to.be.equal(5);
        expect(bounties5[1][4]).to.be.equal(3);
        expect(bounties5[2][4]).to.be.equal(1);
        // Last one should be empty, as there are only 3 bounties.
        expect(bounties5[3][4]).to.be.equal(0);

        const userBounties = await userBountyContract.getUserBounties("local_reviewer", 4);
        // bounties will be sorted in reverse direction.
        // here we are comparing the rewards.
        expect(userBounties[0][4]).to.be.equal(5);
        expect(userBounties[1][4]).to.be.equal(4);
        expect(userBounties[2][4]).to.be.equal(1);
        // Last one should be empty, as there are only 3 bounties.
        expect(userBounties[3][4]).to.be.equal(0);

    });

    function stringToBigInt(str: string): bigint {
        if (str.length > 30) {
            throw new Error("String is too long");
        }

        let result = BigInt(0);
        for (let i = 0; i < str.length; i++) {
            result |= BigInt(str.charCodeAt(i)) << (BigInt(8) * BigInt(31 - i));
        }

        return result;
    }

    it("TestKeccakCompute", async function () {
        expect(stringToBigInt("author")).to.be.equal(BigInt("0x617574686f720000000000000000000000000000000000000000000000000000"));
        expect(stringToBigInt("a")).to.be.equal(BigInt("0x6100000000000000000000000000000000000000000000000000000000000000"));

    })

    it("TestWithConditions", async function () {
        let authorWallet = getWallet(LOCAL_RICH_WALLETS[3].privateKey);
        await nftContract.mint(authorWallet.address, "author").then(tx => tx.wait());


        const tokenContract = await deployContract("ReviewToken", [], { wallet: ownerWallet, silent: true });
        await tokenContract.transfer(userWallet.address, 100000).then(tx => tx.wait());


        const userBountyContract = new Contract(await bountyContract.getAddress(), bountyContract.interface, userWallet);

        const userTokenContract = new Contract(await tokenContract.getAddress(), tokenContract.interface, userWallet);
        await userTokenContract.approve(await bountyContract.getAddress(), 100000).then(tx => tx.wait());

        let conditions = {
            abortTimestamp: 0,
            // Author.
            receiverInvolvement: 1,
            degradationStartSeconds: 0,
            degradationEndSeconds: 0,
        };


        // 
        // Test author condition
        //

        let details = {
            author: "author",
            approvals: [{
                reviewer: "reviewer",
                reviewerDuration: 200,
                authorDuration: 300,
            },
            {
                reviewer: "reviewer2",
                reviewerDuration: 400,
                authorDuration: 500,
            }
            ],
            isMergedToMain: true
        };

        {
            await userBountyContract.addBounty(
                "repo_conditions", 1, "author", 200, tokenContract, conditions
            ).then(tx => tx.wait());
            const authorBounty = Number(await userBountyContract.numBounties()) - 1;
            expect(await userBountyContract.getBountiesCount("repo_conditions", 1)).to.be.equal(1);


            // Author matches - so it should get 100% - so 200 tokens. 
            expect(await userBountyContract.getBountyEstimate(authorBounty, details)).to.be.equal(200);

            // Now author and receiver doesn't match - so it should return 0.
            details.author = "other author";
            expect(await userBountyContract.getBountyEstimate(authorBounty, details)).to.be.equal(0);
        }

        {
            details.author = "author";
            let conditions = {
                abortTimestamp: 0,
                // Author.
                receiverInvolvement: 1,
                degradationStartSeconds: 100,
                degradationEndSeconds: 600,
            };
            await userBountyContract.addBounty(
                "repo_conditions", 1, "author", 200, tokenContract, conditions
            ).then(tx => tx.wait());
            const authorBounty = Number(await userBountyContract.numBounties()) - 1;
            // Author should be counted by 'max' of all durations - so 500 here.
            expect(await userBountyContract.getBountyEstimate(authorBounty, details)).to.be.equal(40);

        }

        // 
        // Test reviewer condition
        //

        conditions.receiverInvolvement = 2;
        {
            await userBountyContract.addBounty(
                "repo_conditions", 1, "reviewer", 500, tokenContract, conditions
            ).then(tx => tx.wait());
            const reviewerBounty = Number(await userBountyContract.numBounties()) - 1;


            // Reviewer matches - so it should get 100% - so 500 tokens. 
            expect(await userBountyContract.getBountyEstimate(reviewerBounty, details)).to.be.equal(500);

            details.approvals[0].reviewer = "other_reviewer";
            // Now, reviewer is not present - so no tokens. 
            expect(await userBountyContract.getBountyEstimate(reviewerBounty, details)).to.be.equal(0);
        }

        conditions.degradationStartSeconds = 100;
        conditions.degradationEndSeconds = 300;
        {
            await userBountyContract.addBounty(
                "repo_conditions", 1, "reviewer", 500, tokenContract, conditions
            ).then(tx => tx.wait());
            const reviewerBounty = Number(await userBountyContract.numBounties()) - 1;
            details.approvals[0].reviewer = "reviewer";
            details.approvals[0].reviewerDuration = 200;
            // we took 200 second, so 50%.
            expect(await userBountyContract.getBountyEstimate(reviewerBounty, details)).to.be.equal(250);

            // Less thatn 'start' seconds - so 100%
            details.approvals[0].reviewerDuration = 100;
            expect(await userBountyContract.getBountyEstimate(reviewerBounty, details)).to.be.equal(500);


            details.approvals[0].reviewerDuration = 800;
            expect(await userBountyContract.getBountyEstimate(reviewerBounty, details)).to.be.equal(0);

            details.approvals[0].reviewerDuration = 301;
            expect(await userBountyContract.getBountyEstimate(reviewerBounty, details)).to.be.equal(0);

            details.approvals[0].reviewerDuration = 300;
            expect(await userBountyContract.getBountyEstimate(reviewerBounty, details)).to.be.equal(0);

            details.approvals[0].reviewerDuration = 250;
            expect(await userBountyContract.getBountyEstimate(reviewerBounty, details)).to.be.equal(125);
        }


        {
            let conditions = {
                abortTimestamp: 0,
                // Reviewer.
                receiverInvolvement: 2,
                degradationStartSeconds: 0,
                degradationEndSeconds: 0,
            };

            await userBountyContract.addBounty(
                "repo_conditions", 1, "reviewer", 500, tokenContract, conditions
            ).then(tx => tx.wait());
            const reviewerBounty = Number(await userBountyContract.numBounties()) - 1;
        }
    });

    it("TestWithConditionsAndClaim", async function () {
        const tokenContract = await deployContract("ReviewToken", [], { wallet: ownerWallet, silent: true });
        await tokenContract.transfer(userWallet.address, 1000).then(tx => tx.wait());
        const reviewerBountyContract = new Contract(await bountyContract.getAddress(), bountyContract.interface, reviewerWallet);


        const userBountyContract = new Contract(await bountyContract.getAddress(), bountyContract.interface, userWallet);

        const userTokenContract = new Contract(await tokenContract.getAddress(), tokenContract.interface, userWallet);
        await userTokenContract.approve(await bountyContract.getAddress(), 1000).then(tx => tx.wait());

        let conditions = {
            abortTimestamp: 0,
            // Reviewer.
            receiverInvolvement: 2,
            degradationStartSeconds: 100,
            degradationEndSeconds: 300,
        };
        let details = {
            author: "author",
            approvals: [{
                reviewer: "reviewer",
                reviewerDuration: 200,
                authorDuration: 300,
            },
            {
                reviewer: "reviewer2",
                reviewerDuration: 400,
                authorDuration: 500,
            }
            ],
            isMergedToMain: true
        };
        await userBountyContract.addBounty(
            "repo_conditions_and_claim", 1, "reviewer", 500, tokenContract, conditions
        ).then(tx => tx.wait());
        const reviewerBounty = Number(await userBountyContract.numBounties()) - 1;

        await oracleContract.updatePRState("repo_conditions_and_claim", 1, 900, details).then(tx => tx.wait());

        await reviewerBountyContract.claimBounty(reviewerBounty, details).then(tx => tx.wait());

        // Reviewer should have received half.
        // And the other half should return to user
        expect(await tokenContract.balanceOf(reviewerWallet.address)).to.be.equal(250);
        expect(await tokenContract.balanceOf(userWallet.address)).to.be.equal(750);
    });

});

