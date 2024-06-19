// Main method here is 'fetchPRStatus'.
import { Octokit } from "@octokit/core";
import { config } from 'dotenv';
import { fetchPRStatus } from "./utils";

config();

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });



fetchPRStatus(octokit, 'matter-labs', 'zksync-era', 2269).then(x => {
    console.log(x);
})
