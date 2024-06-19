// Main method here is 'fetchPRStatus'.
import { Octokit } from "@octokit/core";
import { config } from 'dotenv';
import { fetchPRStatus } from "./utils";
import { getAccount, getPublicClient, getWalletClient } from "../utils/client";
import { updateOracle } from "./updaters";
import { Hex, PublicClient } from "viem";


config();

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const account = getAccount(process.env.WALLET_PRIVATE_KEY as Hex);
const publicClient = getPublicClient();
const walletClient = getWalletClient(account);

const usePaymaster = true;


function fetchAndUpdate(owner: string, repo: string, prId: number) {
    fetchPRStatus(octokit, owner, repo, prId).then(prStatus => {
        console.log(prStatus);
        updateOracle(walletClient, publicClient, owner, repo, prId, prStatus, usePaymaster).then(
            receipt => {
                console.log("Finished");
                console.log(receipt);
            }
        )
    })
}

fetchAndUpdate('matter-labs', 'zksync-era', 2269);
