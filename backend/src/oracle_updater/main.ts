// Main method here is 'fetchPRStatus'.
import { Octokit } from "@octokit/core";
import { config } from 'dotenv';
import { convertPRStatusToPRDetails, fetchPRStatus, fetchPRStatusForOracle } from "./utils";
import { getAccount, getPublicClient, getWalletClient } from "../utils/client";
import { updateOracle, watch } from "./updaters";
import { Hex, PublicClient } from "viem";


config();

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const account = getAccount(process.env.WALLET_PRIVATE_KEY as Hex);
const publicClient = getPublicClient();
const walletClient = getWalletClient(account);

const usePaymaster = false;


function fetchAndUpdate(repo: string, prId: number) {
    fetchPRStatusForOracle(octokit, repo, prId).then(prDetails => {
        console.log(prDetails);
        updateOracle(walletClient, publicClient, repo, prId, prDetails, usePaymaster).then(
            receipt => {
                console.log("Finished");
                console.log(receipt);
            }
        )
    })
}

//fetchAndUpdate('matter-labs', 'zksync-era', 2269);
watch(publicClient, fetchAndUpdate);