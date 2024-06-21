<template>
  <ULandingCard title="Bounty" description="A bounty for PR" color="primary">
    <UBadge
      color="amber"
      variant="outline"
      class="flex justify-center flex-col"
    >
      <UIcon
        class="w-12 h-12 text-amber-600"
        name="ph:coin-vertical-duotone"
        dynamic
      />
      <strong class="text-amber-600"
        >{{ Number(bounty.amount) }} {{ rewardTokenSymbol }}</strong
      >
    </UBadge>
  </ULandingCard>
</template>

<script setup lang="ts">
import {
  prepareWriteContract,
  getContract,
  writeContract,
  readContract,
} from "@wagmi/core";
import { watch } from "vue";
import { Contracts } from "~/abi/contracts";
import { DevNFTABI } from "~/abi/devNft.abi";
import { ReviewTokenABI } from "~/abi/reviewToken.abi";

const props = defineProps<{ bounty: any }>();

const { account } = storeToRefs(useWagmi());
const repo = import.meta.env.VITE_API_TARGET_REPO;

const rewardTokenSymbol = ref("");

const devTokenContract = getContract({
  address: Contracts.DevNFT,
  abi: DevNFTABI,
});

const rewardTokenContract = getContract({
  address: Contracts.ReviewToken,
  abi: ReviewTokenABI,
});

watch(
  props.bounty,
  async (bountyData) => {
    console.log(bountyData);
    const ownerAddress = await devTokenContract.read.ownerOf([
      bountyData.receiverNFTTokenId,
    ]);

    const data = await devTokenContract.read.balanceOf([ownerAddress]);
    if (Number(data) > 0) {
      // with the github tokenid being a keccak, I can't actually
      // get the actual github username from the address side?
    }

    rewardTokenSymbol.value = await rewardTokenContract.read.symbol();
  },
  { immediate: true }
);
</script>
