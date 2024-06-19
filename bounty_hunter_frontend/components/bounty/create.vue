<template>
  <UDashboardModal
    v-model="open"
    title="Create Bounty"
    icon="i-octicon-project-roadmap-16"
    :ui="{
      icon: { base: 'text-grey-500 dark:text-red-400' } as any,
      footer: { base: 'ml-16 mt-4' } as any
    }"
  >
    <template #description>
      <p class="mb-4">Create a bounty for this pull request.</p>
      <strong>Reviewers</strong>
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
        <strong>Reward</strong>
        <UInput v-model="rewardAmount" placeholder="Amount">
          <template #trailing>
            <UIcon name="ph:coin-vertical" dynamic />
          </template>
        </UInput>
      </div>
    </template>
    <template #footer>
      <UButton color="white" label="Cancel" @click="open = false" />
      <UButton color="primary" label="Create Bounty" @click="onCreate" />
    </template>
  </UDashboardModal>
</template>

<script setup lang="ts">
import type { GitHub } from "~/types/github";

const props = defineProps<{ pr: GitHub.PR }>();
const open = defineModel("open");

const rewardAmount = ref("");

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

watch(
  () => open.value,
  () => {
    selected.value = reviewers.value[0];
    rewardAmount.value = "";
  }
);

const onCreate = () => {
  console.log("Creating bounty with reward amount", rewardAmount.value);
  open.value = false;
};
</script>
