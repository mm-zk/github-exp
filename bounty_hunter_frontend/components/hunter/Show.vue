<template>
  <UCard v-if="ghUser">
    <div class="flex items-center justify-between gap-3 py-3 px-4 sm:px-6">
      <div class="flex items-center gap-3 min-w-0">
        <UAvatar :src="ghUser.avatar_url" alt="Avatar" />

        <div class="text-sm min-w-0">
          <p class="text-gray-900 dark:text-white font-medium truncate">
            {{ ghUser.login }}
          </p>
          <p class="text-gray-500 dark:text-gray-400 truncate">
            {{ ghUser.name }}
          </p>
        </div>
        <div v-if="isHunter">{{ userBalance }} RVW</div>
      </div>
      <div class="flex items-center gap-3">
        <UButton color="primary" v-if="isHunter && userAddress">
          <UIcon
            class="w-6 h-6"
            name="ph:coin-vertical"
            dynamic
            @click="giveCoin"
          />
        </UButton>
        <UIcon
          v-if="isHunter"
          class="w-12 h-12 text-primary-800"
          name="game-icons:samus-helmet"
          dynamic
        />
        <UButton
          v-else
          label="Add"
          color="primary"
          @click="$emit('createHunter', ghUser.login)"
        />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { prepareWriteContract, writeContract, getContract } from "@wagmi/core";
import { Contracts } from "~/abi/contracts";
import { DevNFTABI } from "~/abi/devNft.abi";
import { ReviewTokenABI } from "~/abi/reviewToken.abi";

defineEmits(["createHunter"]);

const props = defineProps<{ ghUser: any }>();
const isHunter = ref(false);
const userAddress = ref(null);
const userBalance = ref(null);

const devNFTContract = getContract({
  address: Contracts.DevNFT,
  abi: DevNFTABI,
});

const reviewTokenContract = getContract({
  address: Contracts.ReviewToken,
  abi: ReviewTokenABI,
});

const fetchUserData = async (ghUser) => {
  const data = await devNFTContract.read.exists([ghUser.login.toLowerCase()]);

  if (data) {
    const userToken = await devNFTContract.read.githubToToken([
      ghUser.login.toLowerCase(),
    ]);

    userAddress.value = await devNFTContract.read.ownerOf([userToken]);

    userBalance.value = await reviewTokenContract.read.balanceOf([
      userAddress.value,
    ]);
  }

  isHunter.value = data;
};

watch(
  () => props.ghUser,
  async (val) => {
    if (!!val) {
      await fetchUserData(val);
    }
  },
  { immediate: true }
);

const giveCoin = async () => {
  // am I really transferring tokens from the review token contract?
  const { request } = await prepareWriteContract({
    abi: ReviewTokenABI,
    address: Contracts.ReviewToken,
    functionName: "transfer",
    args: [userAddress.value, parseUnits("42", 0)],
  });
  await writeContract(request);
};
</script>
