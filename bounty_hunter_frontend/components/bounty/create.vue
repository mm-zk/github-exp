<template>
  <UDashboardModal
    v-model="open"
    v-if="pr"
    title="Create Bounty"
    icon="i-octicon-project-roadmap-16"
    :ui="{
      icon: { base: 'text-grey-500 dark:text-red-400' } as any,
      footer: { base: 'ml-16 mt-4' } as any
    }"
  >
    <template #description>
      <p class="mb-4">Create a bounty for this pull request.</p>
      <strong>Reviewer</strong>
      <USelectMenu v-model="selected" :options="reviewers">
        <template #leading>
          <UIcon
            v-if="selected.icon"
            :name="(selected.icon as string)"
            class="w-5 h-5"
          />
          <UAvatar
            v-else-if="selected.avatar"
            v-bind="selected.avatar"
            size="2xs"
          />
        </template>
      </USelectMenu>
      <div class="mt-2">
        <strong>Amount</strong>
        <UInput v-model="rewardAmount" placeholder="42">
          <template #leading>
            <UIcon name="ph:coin-vertical" dynamic />
          </template>
        </UInput>
      </div>
    </template>
    <template #footer>
      <UButton
        color="primary"
        label="Create Bounty"
        @click="onCreate"
        :loading="inProgress"
      />
      <UButton color="white" label="Cancel" @click="open = false" />
    </template>
  </UDashboardModal>
</template>

<script setup lang="ts">
import { prepareWriteContract, writeContract, readContract } from "@wagmi/core";
import { BountyABI } from "~/abi/bounty.abi";
import { Contracts } from "~/abi/contracts";
import { DevNFTABI } from "~/abi/devNft.abi";
import type { GitHub } from "~/types/github";
import { formatUnits, hashMessage } from "viem";

const props = defineProps<{ pr: GitHub.PR | null }>();
const open = defineModel("open");

const rewardAmount = ref("");
const repo = import.meta.env.VITE_API_TARGET_REPO;

const reviewers = computed(() => {
  return [
    {
      id: "nobody",
      label: "---",
      icon: "i-heroicons-user-circle",
    },
    ...(props?.pr?.requested_reviewers.map((reviewer) => ({
      id: reviewer.login,
      label: reviewer.login,
      avatar: {
        src:
          reviewer.avatar_url ||
          `https://www.gravatar.com/avatar/${reviewer.gravatar_id}`,
      },
    })) || []),
  ];
});

const selected = ref(reviewers.value[0]);
const inProgress = ref(false);

watch(
  () => open.value,
  () => {
    selected.value = reviewers.value[0];
    rewardAmount.value = "";
  }
);

const onCreate = async () => {
  const rewardTokenAddress = Contracts.ReviewToken;
  try {
    inProgress.value = true;
    const { request } = await prepareWriteContract({
      abi: BountyABI,
      address: Contracts.Bounty,
      functionName: "addBounty",
      args: [
        repo,
        props.pr?.number.toString(),
        selected.value.id.toLowerCase(),
        rewardAmount.value.toString(),
        rewardTokenAddress,
        {
          abortTimestamp: 0,
          receiverInvolvement: 0,
          degradationStartSeconds: 0,
          degradationEndSeconds: 0,
        },
      ],
    });
    await writeContract(request);

    open.value = false;
  } catch (e) {
    console.log("ERROR", e);
  } finally {
    inProgress.value = false;
  }
};
</script>
