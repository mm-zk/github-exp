import { type Hex, parseAbi } from "viem";
import { getAccount, getPublicClient, getWalletClient } from "./utils/client";
import * as dotenv from 'dotenv';
import { mintNFTFromComments } from "./dev_nft_manager/manager";
const axios = require('axios');

dotenv.config();


const account = getAccount(process.env.WALLET_PRIVATE_KEY as Hex);
const publicClient = getPublicClient();
const walletClient = getWalletClient(account);



async function main() {
    //setInterval(refreshComments, 1000 * 10);
    mintNFTFromComments(walletClient, publicClient);

}

main();

