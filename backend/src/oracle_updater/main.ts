// Main method here is 'fetchPRStatus'.
import { Octokit } from "@octokit/core";
import { config } from 'dotenv';
import { convertPRStatusToPRDetails, fetchPRStatus } from "./utils";
import { getAccount, getPublicClient, getWalletClient } from "../utils/client";
import { updateOracle, watch } from "./updaters";
import { Hex, PublicClient } from "viem";


config();

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const account = getAccount(process.env.WALLET_PRIVATE_KEY as Hex);
const publicClient = getPublicClient();
const walletClient = getWalletClient(account);

const usePaymaster = false;


function fetchAndUpdate(owner: string, repo: string, prId: number) {
    fetchPRStatus(octokit, owner, repo, prId).then(prStatus => {
        const prDetails = convertPRStatusToPRDetails(prStatus);
        console.log(prStatus);
        updateOracle(walletClient, publicClient, owner, repo, prId, prDetails, usePaymaster).then(
            receipt => {
                console.log("Finished");
                console.log(receipt);
            }
        )
    })
}

function splitAndUpdate(repo: string, prId: bigint) {
    const parts = repo.split('/');
    if (parts.length === 2) {
        fetchAndUpdate(parts[0], parts[1], Number(prId));
    } else {
        console.log("invalid repo path " + repo);
    }
}


//fetchAndUpdate('matter-labs', 'zksync-era', 2269);
watch(publicClient, splitAndUpdate);