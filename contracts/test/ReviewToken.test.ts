import { expect } from 'chai';
import { Contract, Wallet } from "zksync-ethers";
import { getWallet, deployContract, LOCAL_RICH_WALLETS } from '../deploy/utils';
import * as ethers from "ethers";

describe("ReviewToken", function () {
  let tokenContract: Contract;
  let ownerWallet: Wallet;
  let userWallet: Wallet;

  before(async function () {
    ownerWallet = getWallet(LOCAL_RICH_WALLETS[0].privateKey);
    userWallet = getWallet(LOCAL_RICH_WALLETS[1].privateKey);

    tokenContract = await deployContract("ReviewToken", [], { wallet: ownerWallet, silent: true });
  });

  it("Should have correct initial supply", async function () {
    const initialSupply = await tokenContract.totalSupply();
    expect(initialSupply).to.equal(BigInt("1000000000")); // 1 billion
  });

  it("Should allow owner to burn tokens", async function () {
    const burnAmount = ethers.parseUnits("10", 0); // Burn 10 tokens
    const tx = await tokenContract.burn(burnAmount);
    await tx.wait();
    const afterBurnSupply = await tokenContract.totalSupply();
    expect(afterBurnSupply).to.equal(BigInt("999999990")); // 999,990 tokens remaining
  });

  it("Should allow user to transfer tokens", async function () {
    const transferAmount = ethers.parseUnits("50", 0); // Transfer 50 tokens
    const tx = await tokenContract.transfer(userWallet.address, transferAmount);
    await tx.wait();
    const userBalance = await tokenContract.balanceOf(userWallet.address);
    expect(userBalance).to.equal(transferAmount);
  });

  it("Should fail when user tries to burn more tokens than they have", async function () {
    const userTokenContract = new Contract(await tokenContract.getAddress(), tokenContract.interface, userWallet);
    const burnAmount = ethers.parseUnits("100", 0); // Try to burn 100 tokens
    try {
      await userTokenContract.burn(burnAmount);
      expect.fail("Expected burn to revert, but it didn't");
    } catch (error) {
      expect(error.message).to.include("burn amount exceeds balance");
    }
  });
});

