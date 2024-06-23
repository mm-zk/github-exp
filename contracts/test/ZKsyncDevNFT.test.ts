import { expect } from 'chai';
import { Contract, Wallet } from "zksync-ethers";
import { getWallet, deployContract, LOCAL_RICH_WALLETS } from '../deploy/utils';
import { AbiCoder, keccak256 } from 'ethers';

describe("ZKsyncDevNFT", function () {
  let nftContract: Contract;
  let ownerWallet: Wallet;
  let recipientWallet: Wallet;

  before(async function () {
    ownerWallet = getWallet(LOCAL_RICH_WALLETS[0].privateKey);
    recipientWallet = getWallet(LOCAL_RICH_WALLETS[1].privateKey);

    nftContract = await deployContract(
      "ZKsyncDevNFT",
      [],
      { wallet: ownerWallet, silent: true }
    );
  });

  it("Should mint a new NFT to the recipient", async function () {
    const tx = await nftContract.mint(recipientWallet.address, "user1");
    await tx.wait();
    const balance = await nftContract.balanceOf(recipientWallet.address);
    expect(balance).to.equal(BigInt("1"));
  });

  it("Should have correct token URI after minting", async function () {
    const tokenId = await nftContract.githubToToken("user1");
    const tokenURI = await nftContract.tokenURI(tokenId);
    expect(tokenURI).to.equal("http://github.com/user1");
  });

  it("Check conversions", async function () {
    const tokenId = await nftContract.githubToToken("user1");
    const convertBack = await nftContract.tokenToGithub(tokenId);
    expect(convertBack).to.be.equal("user1");


    await expect(nftContract.tokenToGithub(0)).to.be.revertedWith("Empty value");
    await expect(nftContract.githubToToken("")).to.be.revertedWith("Empty string");
    await expect(nftContract.githubToToken("012345678901234567890123456789012")).to.be.revertedWith("String is too long");
  });


  it("Should allow owner to mint multiple NFTs", async function () {
    const tx1 = await nftContract.mint(recipientWallet.address, "user2");
    await tx1.wait();
    const tx2 = await nftContract.mint(recipientWallet.address, "user3");
    await tx2.wait();
    const balance = await nftContract.balanceOf(recipientWallet.address);
    expect(balance).to.equal(BigInt("3")); // 1 initial nft + 2 minted
  });

  it("Should not allow non-owner to mint NFTs", async function () {
    try {
      const tx3 = await (nftContract.connect(recipientWallet) as Contract).mint(recipientWallet.address, "otherUser");
      await tx3.wait();
      expect.fail("Expected mint to revert, but it didn't");
    } catch (error) {
      expect(error.message).to.include("Unauthorized");
    }
  });
  it("Allow authorized users to mint", async function () {
    await expect((nftContract.connect(recipientWallet) as Contract)
      .mint(recipientWallet.address, "unauthorizedtest1")).to.be.revertedWith("Unauthorized");

    await nftContract.setAuthorization(recipientWallet.address, true).then(tx => tx.wait());
    // Now minting should work.
    await (nftContract.connect(recipientWallet) as Contract).mint(recipientWallet.address, "unauthorizedtest2").then(tx => tx.wait())

    // Now take permission away.
    await nftContract.setAuthorization(recipientWallet.address, false).then(tx => tx.wait());

    await expect((nftContract.connect(recipientWallet) as Contract)
      .mint(recipientWallet.address, "unauthorizedtest3")).to.be.revertedWith("Unauthorized");


  });
});
