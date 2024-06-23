import * as hre from "hardhat";
import { getWallet } from "./utils";
import { ethers, isAddress, parseEther } from "ethers";

import * as dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: '.generated.env' });


/// Sends 10k RVW tokens and 1 eth to TARGET_WALLET.
export async function main() {
    console.log("Using token:", process.env.REVIEW_TOKEN_ADDRESS);

    const wallet = getWallet();
    const bountyArtifact = await hre.artifacts.readArtifact("CodeReviewBounties");
    const tokenArtifact = await hre.artifacts.readArtifact("ReviewToken");

    const tokenContract = new ethers.Contract(
        process.env.REVIEW_TOKEN_ADDRESS!,
        tokenArtifact.abi,
        wallet
    );

    const contract = new ethers.Contract(
        process.env.BOUNTY_ADDRESS!,
        bountyArtifact.abi,
        wallet
    );

    interface BountyConditions {
        abortTimestamp: bigint,
        receiverInvolvement: number,
        degradationStartSeconds: bigint,
        degradationEndSeconds: bigint
    }

    const conditions: BountyConditions = {
        abortTimestamp: BigInt(new Date().getTime() + 8640000),
        receiverInvolvement: 2,
        degradationStartSeconds: 0n,
        // 1h.
        degradationEndSeconds: 3600n
    };


    await tokenContract.approve(process.env.BOUNTY_ADDRESS, 300).then(tx => tx.wait());
    await contract.addBounty('mm-zk/github-ci-exp', 3, 'mm-work-hash', 100, process.env.REVIEW_TOKEN_ADDRESS!, conditions).then(tx => tx.wait());
    await contract.addBounty('mm-zk/github-ci-exp', 2, 'mm-work-hash', 100, process.env.REVIEW_TOKEN_ADDRESS!, conditions).then(tx => tx.wait());
}

main()