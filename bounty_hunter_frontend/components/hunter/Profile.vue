<template>
  <div v-if="account.isConnected">
    <UCard>
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
      }

      reviewTokens.value = Number(
        await reviewTokenContract.read.balanceOf([newVal.value.address])
      );
    }
  },
  { immediate: true }
);
</script>
