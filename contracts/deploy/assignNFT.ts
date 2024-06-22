import * as hre from "hardhat";
import { getWallet } from "./utils";
import { ethers, isAddress, parseEther } from "ethers";

import * as dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: '.generated.env' });


/// Assigns NFT to a given wallet. 
export async function main() {
    const targetWallet = process.env.TARGET_WALLET;
    const targetGithub = process.env.TARGET_GITHUB;
    if (targetWallet == null) {
        throw new Error("TARGET_WALLET env variable not set.");
    }

    if (targetGithub == null) {
        throw new Error("TARGET_GITHUB env variable not set.");
    }


    if (!isAddress(targetWallet)) {
        throw new Error("TARGET_WALLET is not an address");
    }


    console.log("Receiver:", targetWallet, " github: ", targetGithub);

    console.log("Using NFT:", process.env.NFT_TOKEN_ADDRESS);

    const wallet = getWallet();
    const contractArtifact = await hre.artifacts.readArtifact("ZKsyncDevNFT");
    const contract = new ethers.Contract(
        process.env.NFT_TOKEN_ADDRESS!,
        contractArtifact.abi,
        wallet
    );

    const tokenId = await contract.githubToToken(targetGithub);

    console.log("Preparing to mint: ", tokenId.toString(16));

    console.log("Minting...");
    await contract.mint(targetWallet, targetGithub).then(tx => tx.wait());
}

main()