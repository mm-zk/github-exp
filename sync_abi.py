# Small tool to sync the ABI files between the contracts and frontend.
import json


def sync_abi(source_file, dst_file, const_name):
    print(f"From {source_file} to {dst_file}")
    with open(source_file, 'r') as file:
        data = json.load(file)

    with open(dst_file, 'w') as file:
        file.write(f"export const {const_name} = ")
        json.dump(data['abi'], file, indent=2)
        file.write(" as const;\n")



ABI_DIR='contracts/artifacts-zk/contracts/'
ABI_DST='bounty_hunter_frontend/abi/'


abi_source = 'Bounty.sol/CodeReviewBounties.json'
abi_dst = 'bounty.abi.ts'


const_name = "BountyABI"


ABIS = [
    ('Bounty.sol/CodeReviewBounties.json', 'bounty.abi.ts', "BountyABI"),
    ('GithubOracle.sol/GitHubOracle.json', 'oracle.abi.ts', "OracleABI"),
    ('ReviewToken.sol/ReviewToken.json', 'reviewToken.abi.ts', "ReviewTokenABI"),
    ('ZKsyncDevNFT.sol/ZKsyncDevNFT.json', 'devNft.abi.ts', "DevNFTABI"),
]


for (abi_source, abi_dst, const_name) in ABIS:
    source_file = ABI_DIR + abi_source
    dst_file = ABI_DST + abi_dst
    sync_abi(source_file, dst_file, const_name)