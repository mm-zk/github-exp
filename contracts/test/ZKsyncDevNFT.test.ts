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
    const tokenId = keccak256(AbiCoder.defaultAbiCoder().encode(["string"], ["user1"])); // Assuming the first token minted has ID 1
    const tokenURI = await nftContract.tokenURI(tokenId);
    expect(tokenURI).to.equal("http://github.com/matter-labs/zksync-era/98402519108269256004168789422940289721791679274040548528460083124727674742152");
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
      expect(error.message).to.include("Ownable: caller is not the owner");
    }
  });
});
