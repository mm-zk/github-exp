import { deployContract } from "./utils";
import * as fs from 'fs';


// An example of a basic deploy script
// It will deploy a Greeter contract to selected network
// as well as verify it on Block Explorer if possible for the network
export default async function () {

  const reviewToken = await deployContract("ReviewToken");
  const devNFT = await deployContract("ZKsyncDevNFT");

  const oracleContract = await deployContract("GitHubOracle");

  const bountyContract = await deployContract("CodeReviewBounties");

  await bountyContract.setGitHubOracleAddress(await oracleContract.getAddress()).then(tx => tx.wait());

  const content = [
    `REVIEW_TOKEN_ADDRESS=${await reviewToken.getAddress()}`,
    `NFT_TOKEN_ADDRESS=${await devNFT.getAddress()}`,
    `ORACLE_ADDRESS=${await oracleContract.getAddress()}`,
    `BOUNTY_ADDRESS=${await bountyContract.getAddress()}`,
  ]

  fs.writeFileSync(".generated.env", content.join("\n"), 'utf-8');



}
