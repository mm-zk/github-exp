<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar title="Bounty Board" />
      <UTable
        :loading
        :loading-state="{
          icon: 'i-heroicons-arrow-path-20-solid',
          label: 'Loading...',
        }"
        :progress="{ color: 'primary', animation: 'carousel' }"
        :columns="columns"
        :rows="pullRequests || []"
      >
        <template #pr-data="{ row }">
          <PrStatus :pr="row" />
          <strong>{{ row.number }}</strong>
          {{ row.title }}
          <UButton
            icon="i-heroicons-arrow-up-right-16-solid"
            size="2xs"
            color="primary"
            square
            :to="row.html_url"
            target="_blank"
            variant="ghost"
          />
          <!-- <UIcon name="fluent:window-new-20-regular" dynamic /> -->
        </template>
        <template #bounties-data="{ row }">
          <UBadge
            color="gray"
            variant="solid"
            @click="openBountyModal(row)"
            class="cursor-pointer"
          >
            5<UIcon name="octicon:project-roadmap-16" dynamic class="ml-2" />
          </UBadge>
        </template>
      </UTable>
    </UDashboardPanel>
    <BountyCreate v-model:open="bountyModal" :pr="selectedPR" />
  </UDashboardPage>
</template>

<script setup lang="ts">
import axios from "axios";
import type { GitHub } from "~/types/github";

const repo = import.meta.env.VITE_API_TARGET_REPO;

const columns = [
  { key: "pr", label: "Pull Requests" },
  { label: "Bounties", key: "bounties" },
];

const bountyModal = ref(false);
const selectedPR = ref<GitHub.PR | null>(null);
const openBountyModal = (pr: GitHub.PR) => {
  bountyModal.value = true;
  selectedPR.value = pr;
};

const {
  result: pullRequests,
  execute,
  inProgress: loading,
  error: error,
} = useAsync(async () => {
  const url = `https://api.github.com/repos/${repo}/pulls?state=all`;
  return await axios.get(url).then((response) => {
    const parsedResponse = response.data as GitHub.PR[];
    const prs = parsedResponse.filter(
      (pr) =>
        pr.state === "open" ||
        (pr.state === "closed" &&
          new Date(pr.closed_at!) >=
            new Date(Date.now() - 14 * 24 * 60 * 60 * 1000))
    );

    return prs;
  });
});

execute();
</script>
