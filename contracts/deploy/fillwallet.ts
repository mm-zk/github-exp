import * as hre from "hardhat";
import { getWallet } from "./utils";
import { ethers, isAddress, parseEther } from "ethers";

import * as dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: '.generated.env' });


/// Sends 10k RVW tokens and 1 eth to TARGET_WALLET.
export async function main() {
    const targetWallet = process.env.TARGET_WALLET;
    if (targetWallet == null) {
        throw new Error("TARGET_WALLET env variable not set.");
    }


    if (!isAddress(targetWallet)) {
        throw new Error("TARGET_WALLET is not an address");
    }


    console.log("Receiver:", targetWallet);

    console.log("Using token:", process.env.REVIEW_TOKEN_ADDRESS);

    const wallet = getWallet();
    const contractArtifact = await hre.artifacts.readArtifact("ReviewToken");
    const contract = new ethers.Contract(
        process.env.REVIEW_TOKEN_ADDRESS!,
        contractArtifact.abi,
        wallet
    );

    console.log("Transferring 10k RVW tokens");
    await contract.transfer(targetWallet, 10000).then(tx => tx.wait());

    console.log("Transferring some ETH");
    await wallet.sendTransaction({ to: targetWallet, value: parseEther("1.0") }).then(tx => tx.wait());
}

main()