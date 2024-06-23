<template>
  <div v-if="account.isConnected">
    <UCard >
      {{ ghLogin }} <UButton>Show</UButton><br>
      {{ account.address }}
      <br />
      RVW: {{ reviewTokens }}
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { watch } from "vue";
import { prepareWriteContract, writeContract, getContract } from "@wagmi/core";
import { Contracts } from "~/abi/contracts";
import { DevNFTABI } from "~/abi/devNft.abi";
import { ReviewTokenABI } from "~/abi/reviewToken.abi";

const { account } = storeToRefs(useWagmi());
const isHunter = ref(false);
const reviewTokens = ref(0);
const ghLogin = ref(null);

const devNFTContract = getContract({
  address: Contracts.DevNFT,
  abi: DevNFTABI,
});

const reviewTokenContract = getContract({
  address: Contracts.ReviewToken,
  abi: ReviewTokenABI,
});



watch(
  () => account,
  async (newVal) => {
    if (!!newVal.value && newVal.value.isConnected) {
      const data = await devNFTContract.read.balanceOf([newVal.value.address]);
      if (Number(data) > 0) {
        isHunter.value = true;
        // Currently we fetch only one.
        const tokenId = await devNFTContract.read.tokenOfOwnerByIndex([newVal.value.address, 0n]);
        ghLogin.value = await devNFTContract.read.tokenToGithub([tokenId]);
      }

      reviewTokens.value = Number(
        await reviewTokenContract.read.balanceOf([newVal.value.address])
      );
    }
  },
  { immediate: true }
);
</script>
