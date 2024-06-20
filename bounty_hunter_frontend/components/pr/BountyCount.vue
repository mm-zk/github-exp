<template>
  <UBadge
    v-if="count >= 0"
    color="gray"
    variant="solid"
    class="cursor-pointer"
    :class="{ 'text-gray-500': count === 0 }"
  >
    {{ count
    }}<UIcon
      name="octicon:project-roadmap-16"
      dynamic
      class="ml-2"
      :class="{ 'text-gray-300': count === 0 }"
    />
  </UBadge>
</template>

<script setup lang="ts">
import { readContract } from "@wagmi/core";
import { fromHex } from "viem";
import { BountyABI } from "~/abi/bounty.abi";
import { Contracts } from "~/abi/contracts";

const repo = import.meta.env.VITE_API_TARGET_REPO;
const props = defineProps(["pr"]);
const count = ref();

const bountyCount = async () => {
  const data = await readContract({
    abi: BountyABI,
    address: Contracts.Bounty,
    functionName: "getBountiesCount",
    args: [repo, props.pr.number],
  });

  count.value = fromHex(data as `0x${string}`, "number");
};

bountyCount();
</script>
