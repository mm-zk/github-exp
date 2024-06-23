import { type Hex, parseAbi, WalletClient, PublicClient } from "viem";

import * as dotenv from 'dotenv';
import { Octokit } from "@octokit/core";
const axios = require('axios');

dotenv.config();
dotenv.config({ path: '../contracts/.generated.env' });

const DEV_NFT_ADDRESS = {
    address: process.env.NFT_TOKEN_ADDRESS! as Hex,
}


const NFT_ABI = parseAbi([
    "function mint(address, string) public",
    "function exists(string) public view returns(bool)"
])

async function mintNFT(githubUser: string, account: Hex, walletClient: WalletClient, publicClient: PublicClient) {
    console.log(`Minting NFT for ${githubUser}`)
    const exists = await publicClient.readContract({
        address: DEV_NFT_ADDRESS.address,
        abi: NFT_ABI,
        functionName: "exists",
        args: [githubUser],
    });
    if (exists) {
        console.log(`NFT for this user already exists.`)
    } else {
        const transactionHash = await walletClient.writeContract({
            address: DEV_NFT_ADDRESS.address,
            abi: NFT_ABI,
            functionName: "mint",
            account: walletClient.account!,
            chain: walletClient.chain!,
            args: [account, githubUser]
        });
        console.log(`Sent tx: ${transactionHash}`);
        const receipt = await publicClient.waitForTransactionReceipt({ hash: transactionHash });
        console.log(`Receipt: ${receipt.status}`);
    }
}





interface User {
    login: string;
}


interface GithubComment {
    id: number;
    body: string;
    number: number;
    user: User;
}


// Function to fetch comments for a given GitHub issue
async function fetchComments(octokit: Octokit, owner: string, repo: string, issueNumber: number) {
    try {
        return (await octokit.request('GET /repos/{owner}/{repo}/issues/{issueNumber}/comments', {
            owner,
            repo,
            issueNumber
        })).data as GithubComment[];
    } catch (error) {
        console.error('Error fetching comments:', error);
        return null;
    }
}

// Function to extract mint addresses and filter by the first occurrence per user
function extractMintAddresses(comments: GithubComment[]) {
    const addressPattern = /MINT_ADDRESS:\s*(\S+)/;
    const addresses = new Map();

    comments.forEach(comment => {
        const match = addressPattern.exec(comment.body);
        if (match && !addresses.has(comment.user.login)) {
            addresses.set(comment.user.login, match[1]);
        }
    });

    return Array.from(addresses).map(([user, address]) => ({ user, address }));
}

let allAddresses = new Map();


export async function mintNFTFromComments(octokit: Octokit, owner: string, repo: string, issueNumber: number, walletClient: WalletClient, publicClient: any, whitelist: string[]) {
    const filteredAddresses = await fetchComments(octokit, owner, repo, issueNumber).then(
        (comments) => {
            return extractMintAddresses(comments ?? []);
        }
    );
    const authors = new Set(whitelist);

    filteredAddresses.forEach(async (value) => {
        if (!authors.has(value.user)) {
            console.log("Skipping ", value.user, " not on whitelist");
        } else {
            if (!allAddresses.has(value.user)) {
                console.log(`Adding mapping: ${value.user} -> ${value.address}`);
                allAddresses.set(value.user, value.address);
                await mintNFT(value.user, value.address, walletClient, publicClient);
            }
        }
    });
}
