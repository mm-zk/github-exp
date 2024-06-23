
import { type Hex, parseAbi, WalletClient, PublicClient } from "viem";
import { getAccount, getPublicClient, getWalletClient } from "../utils/client";

import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: '../contracts/.generated.env' });


const account = getAccount(process.env.WALLET_PRIVATE_KEY as Hex);
const publicClient = getPublicClient();
const walletClient = getWalletClient(account);

const REVIEW_TOKEN_ADDRESS = {
    address: process.env.REVIEW_TOKEN_ADDRESS! as Hex,
}


const ERC_ABI = parseAbi([
    "function transfer(address, uint256) public",
    "function balanceOf(address) public view returns(uint256)",
])


async function sendTokens(address: string, amount: bigint): Promise<void> {
    const transactionHash = await walletClient.writeContract({
        address: REVIEW_TOKEN_ADDRESS.address,
        abi: ERC_ABI,
        functionName: "transfer",
        args: [address as Hex, amount],
    });

    console.log(`Sent tx: ${transactionHash}`);
    const receipt = await publicClient.waitForTransactionReceipt({ hash: transactionHash });
    console.log(`Receipt: ${receipt.status}`);

}


async function readAddressesAndSendTokens(filePath: string): Promise<void> {
    console.log("ERC address: ", REVIEW_TOKEN_ADDRESS.address);
    console.log("Sending from: ", walletClient.account.address);
    const balance = await publicClient.readContract({
        address: REVIEW_TOKEN_ADDRESS.address,
        abi: ERC_ABI,
        functionName: "balanceOf",
        args: [walletClient.account.address as Hex],
    });

    console.log("Balance at start ", balance);

    const addresses = fs.readFileSync(filePath, 'utf-8').split('\n').filter(Boolean);

    for (const address of addresses) {
        await sendTokens(address, BigInt(100)).catch((e) => {
            console.error(e);
            throw new Error("Failed");
        }
        );
    };
}

readAddressesAndSendTokens("src/airdrop/addresses.txt");