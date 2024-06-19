import { type Hex, createPublicClient, createWalletClient, http, Account, PublicClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { eip712WalletActions } from 'viem/zksync'
import { defaultChain } from "./chains";

export const getPublicClient = (chain = defaultChain) => {
  return createPublicClient({
    chain,
    transport: http()
  });
}
export const getAccount = (privateKey: Hex) => {
  return privateKeyToAccount(privateKey);
}
export const getWalletClient = (account: Account, chain = defaultChain) => {
  return createWalletClient({
    account,
    chain,
    transport: http()
  }).extend(eip712WalletActions());
}