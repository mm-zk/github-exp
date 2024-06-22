import { type Hex, parseAbi } from "viem";
import { getAccount, getPublicClient, getWalletClient } from "./utils/client";
import * as dotenv from 'dotenv';
import { mintNFTFromComments } from "./dev_nft_manager/manager";
const axios = require('axios');

dotenv.config();
dotenv.config({ path: '../.config.env' });



const account = getAccount(process.env.WALLET_PRIVATE_KEY as Hex);
const publicClient = getPublicClient();
const walletClient = getWalletClient(account);



async function main() {
    //setInterval(refreshComments, 1000 * 10);
    const owner = process.env.MINT_REPO_OWNER!;
    const repo = process.env.MINT_REPO!;
    const issueNumber = parseInt(process.env.MINT_REPO_ISSUE!, 10);
    mintNFTFromComments(owner, repo, issueNumber, walletClient, publicClient);
}

main();

