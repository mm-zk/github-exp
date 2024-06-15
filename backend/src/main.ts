import { type Hex, parseUnits } from "viem";



import ERC20_ABI from "./abi/ERC20";

import { getAccount, getPublicClient, getWalletClient } from "./utils/client";
import { LOCAL_RICH_WALLETS } from "./utils/constants";

const EXAMPLE_ERC20_TOKEN = {
    address: "0xaAF5f437fB0524492886fbA64D703df15BF619AE" as Hex,
    decimals: 18,
}

const WALLET_PRIVATE_KEY = LOCAL_RICH_WALLETS[0].privateKey;
const account = getAccount(WALLET_PRIVATE_KEY);
const publicClient = getPublicClient();
const walletClient = getWalletClient(account);

// Read contract
const readContract = async () => {
    const balance = await publicClient.readContract({
        address: EXAMPLE_ERC20_TOKEN.address,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: ["0xBC989fDe9e54cAd2aB4392Af6dF60f04873A033A" as Hex], //account.address],
    });
    console.log(`Account is ${account.address}`)
    console.log(`Balance is ${balance}`)
}

// Write contract
const writeContract = async () => {
    const transactionHash = await walletClient.writeContract({
        address: EXAMPLE_ERC20_TOKEN.address,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [account.address, parseUnits("100", EXAMPLE_ERC20_TOKEN.decimals)],
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash: transactionHash });
}

async function foobar() {
    await readContract();


    console.log("Done");
}


console.log("Started");

foobar();
