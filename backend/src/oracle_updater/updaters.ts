import { type Hex, WalletClient, keccak256, toHex, getContract, TransactionReceipt } from "viem";
import * as dotenv from 'dotenv';
import { PRStatus } from "./utils";
import { oracleAbi } from "./oracleabi";
import { getGeneralPaymasterInput } from "viem/zksync";
const axios = require('axios');

dotenv.config();
dotenv.config({ path: '../contracts/.generated.env' });

const GITHUB_ORACLE = {
    address: process.env.ORACLE_ADDRESS! as Hex,
}



interface ReviewTimeEntry {
    reviewer: bigint;
    reviewerDuration: bigint;
    authorDuration: bigint;
}

interface PRDetails {
    author: bigint,
    isMergedToMain: boolean,
    approvals: ReviewTimeEntry[],
}

function githubLoginToU128(githubLogin: string): bigint {
    return BigInt(keccak256(toHex(githubLogin))) >> BigInt(128);

}

export async function updateOracle(walletClient: WalletClient, publicClient: any, owner: string, repo: string, prNumber: number, prStatus: PRStatus, usePaymaster: boolean): Promise<TransactionReceipt> {
    const repository = `${owner}/${repo}`;

    const approvers: ReviewTimeEntry[] = [...prStatus.reviewStatus.entries()].sort((a, b) => a[0].localeCompare(b[0])).filter(x => x[1].approved).map(x => {

        return {
            reviewer: githubLoginToU128(x[0]),
            reviewerDuration: BigInt(x[1].reviewerDuration),
            authorDuration: BigInt(x[1].authorDuration)
        }
    });

    const prABI: PRDetails = {
        author: githubLoginToU128(prStatus.author),
        isMergedToMain: prStatus.isMergedToMain,
        approvals: approvers
    };

    const contract = getContract({
        address: GITHUB_ORACLE.address,
        abi: oracleAbi,
        client: {
            public: publicClient, wallet: walletClient
        }
    });

    const transactionHash = await contract.write.updatePRState([
        repository, BigInt(prNumber), BigInt(new Date().getTime()), prABI
    ], {
        chain: walletClient.chain!, account: walletClient.account!,
        paymaster: usePaymaster ? GITHUB_ORACLE.address : null,
        paymasterInput: usePaymaster ? getGeneralPaymasterInput({ innerInput: '0x' }) : null

    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash: transactionHash });

    return receipt;

}