import { type Hex, WalletClient, keccak256, toHex, getContract, TransactionReceipt, encodeAbiParameters, PublicClient, decodeAbiParameters } from "viem";
import * as dotenv from 'dotenv';
import { PRDetails, PRStatus, ReviewTimeEntry } from "./utils";
import { oracleAbi } from "./oracleabi";
import { getGeneralPaymasterInput } from "viem/zksync";
const axios = require('axios');

dotenv.config();
dotenv.config({ path: '../contracts/.generated.env' });

const GITHUB_ORACLE = {
    address: process.env.ORACLE_ADDRESS! as Hex,
}


type OnPRRequested = (repo: string, prId: number) => void;

export function watch(publicClient: any, callback: OnPRRequested) {
    console.log("Starting...", GITHUB_ORACLE.address);

    return publicClient.watchContractEvent({
        address: GITHUB_ORACLE.address,
        abi: oracleAbi,
        eventName: 'PRUpdateRequested',
        onLogs: (logs: any) => {
            console.log(logs);
            console.log("parsing...");
            console.log(logs[0].data);
            const payload = decodeAbiParameters(
                [
                    { name: 'repository', type: 'string' },
                    { name: 'pr', type: 'uint256' }
                ],
                logs[0].data
            );
            const regex = /[^a-zA-Z0-9\/\-\_]/;
            if (regex.test(payload[0])) {
                console.log("Invalid chars: ", payload[0]);
            } else {
                callback(payload[0], Number(payload[1]));
            }
        }
    })
}


export async function updateOracle(walletClient: WalletClient, publicClient: any, repo: string, prNumber: number, prDetails: PRDetails, usePaymaster: boolean): Promise<TransactionReceipt> {
    const contract = getContract({
        address: GITHUB_ORACLE.address,
        abi: oracleAbi,
        client: {
            public: publicClient, wallet: walletClient
        }
    });

    const transactionHash = await contract.write.updatePRState([
        repo, BigInt(prNumber), BigInt(new Date().getTime()), prDetails
    ], {
        chain: walletClient.chain!, account: walletClient.account!,
        paymaster: usePaymaster ? GITHUB_ORACLE.address : null,
        paymasterInput: usePaymaster ? getGeneralPaymasterInput({ innerInput: '0x' }) : null

    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash: transactionHash });

    return receipt;

}