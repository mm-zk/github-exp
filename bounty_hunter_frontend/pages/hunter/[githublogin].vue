<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar title="PR Bounty List" />
      <UDashboardToolbar class="py-0 px-4 overflow-x-auto">
        Browsing #{{ login }} github
      </UDashboardToolbar>
      <div v-if="notMapped">
        ADDRESS NOT Mapped - please visit <button @click="goToIssue">github issue page</button> ({{ mappingAddress }})
      </div>
      <div v-if="!notMapped">
        Account is mapped to an NFT.<br>
        Current owner of this github is: {{ nftowner }} <br>

        <div v-if="account.isConnected">

        <div v-if="walletOwnsAccount">
          YOU ARE THE OWNER.
        </div>
        <div v-if="!walletOwnsAccount">
          You are NOT the owner - maybe you connected a wrong wallet?
        </div>
        </div>

        <div v-if="!account.isConnected">

          You didn't connect the wallet, but you can still browse.
        
        </div>

      <UCard>
        {{ nftowner }}
        <br />
        RVW: {{reviewTokens}}
      </UCard>

      </div>
      <div>
        Bounties for this user {{bountyCount}} <br>

        <UContainer class="mt-4">
        <UPageGrid>
          <BountyShow
            v-for="(bounty, index) in bounties"
            :key="index"
            :bounty="bounty"
          />
        </UPageGrid>
      </UContainer>




      </div>
      

      
    </UDashboardPanel>
  </UDashboardPage>
</template>

<script setup lang="ts">
import {
  prepareWriteContract,
  getContract,
  writeContract,
  readContract,
} from "@wagmi/core";
import type { Hex } from "viem";
import { watch } from "vue";
import { BountyABI } from "~/abi/bounty.abi";
import { Contracts } from "~/abi/contracts";
import { DevNFTABI } from "~/abi/devNft.abi";
import { ReviewTokenABI } from "~/abi/reviewToken.abi";

const route = useRoute();
const { account } = storeToRefs(useWagmi());
const repo = import.meta.env.VITE_API_TARGET_REPO;

const mappingAddress = import.meta.env.VITE_API_MAPPING_URL; 

const login = route.params.githublogin as string;

const NFTContract = getContract({
  address: Contracts.DevNFT as unknown as Hex,
  abi: DevNFTABI,
});

const reviewTokens = ref(0);


const mappedAddress = ref("");
const notMapped = ref(false);

const tokenId = ref(BigInt(0));
const nftowner = ref("");


const walletOwnsAccount = ref(false);


const reviewTokenContract = getContract({
  address: Contracts.ReviewToken as unknown as Hex,
  abi: ReviewTokenABI,
});

const bountyContract = getContract({
  address: Contracts.Bounty as unknown as Hex,
  abi: BountyABI,
});


const goToIssue = async () => {
  window.location.href = mappingAddress;
}


const bountyCount = ref(0);
const bounties = ref([]);
// const pageCount = 1;
// const page = ref(1);

const loadBountyData = async () => {
  bountyCount.value = Number(
    await bountyContract.read.getUserBountiesCount([login])
  );

  bounties.value = await bountyContract.read.getUserBounties([
    login,
    BigInt(bountyCount.value),
  ]);
  console.log(bounties.value);
};


const loadNFTMapping = async () => {
    const loginExists = await NFTContract.read.exists([login]);
    if (loginExists) {
      mappedAddress.value = "exists";
      const token = await NFTContract.read.githubToToken([login]);
      tokenId.value = token;
      const owner = await NFTContract.read.ownerOf([token]);
      nftowner.value = owner;

      walletOwnsAccount.value = (owner == account.value.address);

      reviewTokens.value = Number(
        await reviewTokenContract.read.balanceOf([owner])
      );


    } else {
      mappedAddress.value = "not set";
      notMapped.value = true;
    }
    loadBountyData();


};

loadNFTMapping();

</script>
