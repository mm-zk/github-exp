<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar title="PR Bounty List" />
      <UDashboardToolbar class="py-0 px-4 overflow-x-auto">
        PR #{{ route.params.id }} - {{ bountyCount }} bounties
      </UDashboardToolbar>

      <UContainer class="mt-4">
        <UPageGrid>
          <BountyShow
            v-for="(bounty, index) in bounties"
            :key="index"
            :bounty="bounty"
          />
        </UPageGrid>
        <!-- <div class="mt-6 flex justify-center">
          <UPagination
            v-model="page"
            :page-count="pageCount"
            :total="bountyCount"
          />
        </div> -->
      </UContainer>
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
import { watch } from "vue";
import { BountyABI } from "~/abi/bounty.abi";
import { Contracts } from "~/abi/contracts";
import { DevNFTABI } from "~/abi/devNft.abi";

const route = useRoute();
const { account } = storeToRefs(useWagmi());
const repo = import.meta.env.VITE_API_TARGET_REPO;

const bountyContract = getContract({
  address: Contracts.Bounty,
  abi: BountyABI,
});

const bountyCount = ref(0);
const bounties = ref([]);
// const pageCount = 1;
// const page = ref(1);

const loadBountyData = async () => {
  bountyCount.value = Number(
    await bountyContract.read.getBountiesCount([repo, route.params.id])
  );

  bounties.value = await bountyContract.read.getBounties([
    repo,
    route.params.id,
    BigInt(bountyCount.value),
  ]);
  console.log(bounties.value);
};

loadBountyData();
</script>
