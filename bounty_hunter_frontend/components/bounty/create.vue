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
        <div class="flex">
          <UInput v-model="rewardAmount" placeholder="42" class="mr-2">
            <template #leading>
              <UIcon name="ph:coin-vertical" dynamic />
            </template>
          </UInput>
          <UButton @click="giveAllowance" :loading="allowanceInProgress">
            <UIcon name="mdi:hand-coin-outline" dynamic />
            Allowance
          </UButton>

        </div>
        <UAlert color="red" v-if="insufficientAllowance"  title="Insufficient allowance"  description="Please give more allowance by clicking the button above"/>

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
import {
  prepareWriteContract,
  getContract,
  writeContract,
  readContract,
} from "@wagmi/core";
import { BountyABI } from "~/abi/bounty.abi";
import { Contracts } from "~/abi/contracts";
import { DevNFTABI } from "~/abi/devNft.abi";
import type { GitHub } from "~/types/github";
import { ContractFunctionExecutionError, ContractFunctionRevertedError, formatUnits, hashMessage } from "viem";
import { ReviewTokenABI } from "~/abi/reviewToken.abi";

const { account } = storeToRefs(useWagmi());

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
const allowanceInProgress = ref(false);
const insufficientAllowance = ref(false);

watch(
  () => open.value,
  () => {
    selected.value = reviewers.value[0];
    rewardAmount.value = "";
  }
);

const reviewTokenContract = getContract({
  address: Contracts.ReviewToken,
  abi: ReviewTokenABI,
});
// We should check if people approved enough allowance, and if no, then ask them to give more.
const giveAllowance = async () => {
  try {
    allowanceInProgress.value = true;
    const allowance = await reviewTokenContract.read.allowance([
      account.value.address,
      Contracts.Bounty,
    ]);
    insufficientAllowance.value = false;

    if (allowance < rewardAmount.value) {
      const { request } = await prepareWriteContract({
        abi: ReviewTokenABI,
        address: Contracts.ReviewToken,
        functionName: "approve",
        args: [
          Contracts.Bounty,
          BigInt(+rewardAmount.value - Number(allowance)),
        ],
      });
      await writeContract(request);
    }
  } catch (e) {
    console.log("ERROR", e);
  } finally {
    allowanceInProgress.value = false;
  }
};

const getRevertReason = (error: ContractFunctionExecutionError): string | undefined => {
    const cause = error.cause;
    if (cause.name == "ContractFunctionRevertedError") {
      const c = cause as ContractFunctionRevertedError;
      return c.reason;
    }
    console.log("Unexpected error from contract: ", error);
    return undefined;
}


const onCreate = async () => {
  const rewardTokenAddress = Contracts.ReviewToken;
  try {
    inProgress.value = true;
    const { request} = await prepareWriteContract({
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
          // FIXME: allow users to select this. (for now set to 5 days)
          abortTimestamp: BigInt(Math.floor(Date.now() / 1000) + 432000),
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
    const error = e as ContractFunctionExecutionError;
    const reason = getRevertReason(error);
    if (reason == "ERC20: insufficient allowance") {
      insufficientAllowance.value = true;
    } else {
      showError("Contract write failed with: " + reason);
    }

  } finally {
    inProgress.value = false;
  }
};
</script>
