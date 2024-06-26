<template>
  <ULandingCard title="Bounty" description="A bounty for PR" color="primary">
    <UButton @click="goToPR">PR {{ props.bounty.repositoryName }}/{{ props.bounty.pullRequestId }}</UButton>
    <br />
    <UTooltip :text=bountyReceiverAddress>
      <UBadge
        :color="textColor"
        variant="outline"
        class="flex justify-center flex-row"
      >
      <UIcon
        class="w-12 h-12"
        :class="iconClass"
        name="mdi:arrow-right"
        dynamic
      />
      Receiver: {{ bountyReceiver }} 
      </UBadge>
    </UTooltip> 


    <button @click="isShowDebug = !isShowDebug" class="toggle-button">
      {{ isShowDebug ? 'Hide Debug Info' : 'Show Debug Info' }}
    </button>
    <div v-if="isShowDebug" class="debug-info">
      <p>
      Expired: {{ isExpired }} (current timestamp:
      {{ props.currentBlockTimestamp }} vs expiration
      {{ props.bounty.conditions.abortTimestamp }}
      )
      </p>
      PR Status: {{ prDetailsString }}


    </div>
    
    <div v-if="!props.bounty.claimed">
      
      <div v-if="isExpired">
        <UButton @click="abortBounty()">Abort bounty</UButton>
      </div>
      <div v-if="!isExpired">
        <div v-if="isClaimable">
          <div v-if="!isOracleUpToDate">
            Oracle is behind. Last update: {{ latestOracleUpdate }} <br/>
            <UButton @click="askForOracleUpdate()">ASK for oracle update</UButton>
          </div>
          <div v-if="isOracleUpToDate">
            <UButton @click="claimBounty()">CLAIM NOW.</UButton>
          </div>
        </div>
        <div v-if="!isClaimable">
          <UButton :disabled=true color="white"  >Cannot claim: PR not merged yet </UButton></div>
      </div>
    </div>

    <UBadge
      :color="textColor"
      variant="outline"
      class="flex justify-center flex-col"
    >
      <UIcon
        class="w-12 h-12"
        :class="iconClass"
        name="ph:coin-vertical-duotone"
        dynamic
      />
      <strong :class="iconClass"
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
import { Octokit } from "@octokit/core";
import { OracleABI } from "~/abi/oracle.abi";
import type { ContractFunctionExecutionError, ContractFunctionRevertedError } from "viem";


const props = defineProps<{
  bounty: any;
  currentBlockTimestamp: number;
}>();
console.log("preps: ", props.currentBlockTimestamp);
console.log("preps: ", props.bounty);

const { account } = storeToRefs(useWagmi());

const octokit = new Octokit();


const globalError = ref(false);
const rewardTokenSymbol = ref("");

const bountyReceiver = ref("");
const bountyReceiverAddress = ref("");

// TODO: check PR status.
const isClaimable = ref(true);
const isOracleUpToDate = ref(false);
const latestOracleUpdate = ref(0);

const isShowDebug = ref(false);

const iconClass = computed(() => {
  if (props.bounty.claimed == true) {
    return "text-gray-600";  
  }
  if (isExpired) {
    return "text-red-600";  
  }
  if (isClaimable.value) {
    return "text-green-600";  
  }
  return "text-amber-600";
});

const textColor = computed(() => {
  if (props.bounty.claimed == true) {
    return "gray";  
  }
  if (isExpired) {
    return "red";  
  }
  if (isClaimable.value) {
    return "green";  
  }
  return "amber";

});

const devTokenContract = getContract({
  address: Contracts.DevNFT,
  abi: DevNFTABI,
});

const rewardTokenContract = getContract({
  address: Contracts.ReviewToken,
  abi: ReviewTokenABI,
});

const oracleContract = getContract({
  address: Contracts.Oracle,
  abi: OracleABI,
});

const goToPR = async () => {
  window.location.href = "https://github.com/" + props.bounty.repositoryName + "/pull/" + props.bounty.pullRequestId;
};

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
  // TODO: add fee for paymaster.
  const {request} = await prepareWriteContract({
    abi: OracleABI,
    address: Contracts.Oracle,
    functionName: "requestPRUpdate",
    args: [
      props.bounty.repositoryName,
      props.bounty.pullRequestId
    ]
  });
  await writeContract(request);
};

const claimBounty = async () => {
  const {request} = await prepareWriteContract({
    abi: BountyABI,
    address: Contracts.Bounty,
    functionName: "claimBounty",
    args: [
      props.bounty.bountyId,
      prDetails.value
    ]
  });
  await writeContract(request);

  // TODO - add warning if you are not the receiver.
};

const prDetails = ref();
const prDetailsString = ref("");

// Gets current PR state from github.
// Afterwards we should check whether it matches the one that is in oracle.
// But it only makes sense to compare after PR is merged.
const getCurrentPRState = async () => {
  console.log("repo name is:", props.bounty.repositoryName);
  const localPrDetails = await fetchPRStatusForOracle(octokit, props.bounty.repositoryName, Number(props.bounty.pullRequestId));
  console.log("pr Status: ", localPrDetails);

  function replacer(key: string, value: any) {
    if (typeof value === 'bigint') {
      return value.toString(); // or however you want to serialize it
    } else {
      return value;
    }
  }

  prDetails.value = localPrDetails;
  // temporary put this as string, as javascript doesn't know how to handle bigint.
  const jsonString = JSON.stringify(localPrDetails, replacer);
  prDetailsString.value = jsonString;
  return localPrDetails;
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

const compareWithOracle = async (prDetails: PRDetails) => {
  oracleContract.read.verifyPRDetails([props.bounty.repositoryName, props.bounty.pullRequestId, prDetails]).then( _ => 
    {
      isOracleUpToDate.value = true;
    }
    
  ).catch((e) => {

    const error = e as ContractFunctionExecutionError;
    isOracleUpToDate.value = false;
    if (getRevertReason(error) == "State hash differs") {
      oracleContract.read.lastUpdated([props.bounty.repositoryName, props.bounty.pullRequestId]).then(
        lastUpdated => {
          latestOracleUpdate.value = Number(lastUpdated);
        }
      )
    } else {
      globalError.value = true;
    }
  });

};


getCurrentPRState().then(prDetails => {
  isClaimable.value = prDetails.isMergedToMain;
  compareWithOracle(prDetails);

});



watch(
  props.bounty,
  async (bountyData) => {
    console.log(bountyData);
    await devTokenContract.read
      .ownerOf([bountyData.receiverNFTTokenId])
      .then((ownerAddress) => {
        bountyReceiverAddress.value = ownerAddress;
        
      })
      .catch((error) => {
        console.log("receiver doesnt have NFT yet");
      });

    await devTokenContract.read
      .tokenToGithub([bountyData.receiverNFTTokenId]).then((githublogin) => {
        bountyReceiver.value = githublogin;
      })


    rewardTokenSymbol.value = await rewardTokenContract.read.symbol();
  },
  { immediate: true }
);
</script>
