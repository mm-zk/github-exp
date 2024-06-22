<template>
  <ULandingCard title="Bounty" description="A bounty for PR" color="primary">
    PR: {{ props.bounty.repositoryName }} {{ props.bounty.pullRequestId }}
    <br />
    Claimed: {{ props.bounty.claimed }} <br />

    <div v-if="!props.bounty.claimed">
      Expired: {{ isExpired }} (current timestamp:
      {{ props.currentBlockTimestamp }} vs expiration
      {{ props.bounty.conditions.abortTimestamp }}
      )
      <div v-if="isExpired">
        <button @click="abortBounty()">Abort bounty</button>
      </div>
      <div v-if="!isExpired">
        <div v-if="isClaimable">
          Can claim
          <div v-if="!isOracleUpToDate">
            Oracle is behind.
            <button @click="askForOracleUpdate()">ASK for oracle update</button>
          </div>
          <div v-if="isOracleUpToDate">
            <button @click="claimBounty()">CLAIM NOW.</button>
          </div>
        </div>
        <div v-if="!isClaimable">Cannot claim PR not merged yet</div>
      </div>
    </div>

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
import { BountyABI } from "~/abi/bounty.abi";
import { Contracts } from "~/abi/contracts";
import { DevNFTABI } from "~/abi/devNft.abi";
import { ReviewTokenABI } from "~/abi/reviewToken.abi";

const props = defineProps<{
  bounty: any;
  currentBlockTimestamp: number;
}>();
console.log("preps: ", props.currentBlockTimestamp);
console.log("preps: ", props.bounty);

const { account } = storeToRefs(useWagmi());
const repo = import.meta.env.VITE_API_TARGET_REPO;

const rewardTokenSymbol = ref("");

// TODO: check PR status.
const isClaimable = ref(true);
const isOracleUpToDate = ref(false);

const devTokenContract = getContract({
  address: Contracts.DevNFT,
  abi: DevNFTABI,
});

const rewardTokenContract = getContract({
  address: Contracts.ReviewToken,
  abi: ReviewTokenABI,
});

const isExpired =
  props.bounty.conditions.abortTimestamp < props.currentBlockTimestamp;

const abortBounty = async () => {
  const { request } = await prepareWriteContract({
    abi: BountyABI,
    address: Contracts.Bounty,
    functionName: "abortBounty",
    args: [props.bounty.bountyId],
  });
  await writeContract(request);
};

const askForOracleUpdate = async () => {
  // TODO - call requestPRUpdate on oracle contract.
};

const claimBounty = async () => {
  // TODO - call claim bounty on Bounty contract.
};

watch(
  props.bounty,
  async (bountyData) => {
    console.log(bountyData);
    await devTokenContract.read
      .ownerOf([bountyData.receiverNFTTokenId])
      .then((ownerAddress) => {
        devTokenContract.read.balanceOf([ownerAddress]).then((data) => {
          if (Number(data) > 0) {
            // with the github tokenid being a keccak, I can't actually
            // get the actual github username from the address side?
          }
        });
      })
      .catch((error) => {
        console.log("receiver doesnt have NFT yet");
      });

    rewardTokenSymbol.value = await rewardTokenContract.read.symbol();
  },
  { immediate: true }
);
</script>
