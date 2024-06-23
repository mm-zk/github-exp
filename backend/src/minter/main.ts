import { type Hex } from "viem";
import { Octokit } from "@octokit/core";

import { getAccount, getPublicClient, getWalletClient } from "../utils/client";
import * as dotenv from 'dotenv';
import { mintNFTFromComments } from "../dev_nft_manager/manager";
import fs from 'fs';

const axios = require('axios');

dotenv.config();
dotenv.config({ path: '../.config.env' });



const account = getAccount(process.env.WALLET_PRIVATE_KEY as Hex);
const publicClient = getPublicClient();
const walletClient = getWalletClient(account);
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });




async function main() {
    const rawData = fs.readFileSync("authors.json", 'utf8');
    const authors = JSON.parse(rawData)['authors'];

    console.log("Whitelist length: ", authors.length);


    //setInterval(refreshComments, 1000 * 10);
    const owner = process.env.MINT_REPO_OWNER!;
    const repo = process.env.MINT_REPO!;
    const issueNumber = parseInt(process.env.MINT_REPO_ISSUE!, 10);
    console.log("Reading comments from ", owner, "/", repo, "/", issueNumber);
    mintNFTFromComments(octokit, owner, repo, issueNumber, walletClient, publicClient, authors);
}

main();

