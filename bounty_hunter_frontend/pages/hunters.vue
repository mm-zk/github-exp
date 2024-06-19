<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar title="Bounty Hunters" />
      <UDashboardPanelContent>
        <UDashboardSection
          title="Manage Members"
          description="Manage the users that are part of the bounty hunting program."
          orientation="horizontal"
          class="px-4 mt-6"
        >
          <template #icon>
            <UIcon class="w-12 h-12" name="game-icons:samus-helmet" dynamic />
          </template>

          <template #links>
            <UButton
              label="Add a user"
              color="primary"
              @click="isInviteModalOpen = true"
            />
          </template>

          <UCard
            :ui="{ header: { padding: 'p-4 sm:px-6' }, body: { padding: '' } }"
            class="min-w-0"
          >
            <template #header>
              <div class="flex">
                <UInput
                  class="m-auto w-full pr-2"
                  v-model="searchHunterInput"
                  icon="i-heroicons-magnifying-glass"
                  placeholder="Search members"
                  @keyup.enter="searchHunter"
                  autofocus
                />
                <UButton label="Search" @click="searchHunter" />
              </div>
            </template>

            <!-- ~/components/settings/MembersList.vue -->
            <div v-if="userData" class="m-4">
              <UCard>
                <div
                  class="flex items-center justify-between gap-3 py-3 px-4 sm:px-6"
                >
                  <div class="flex items-center gap-3 min-w-0">
                    <UAvatar :src="userData.avatar_url" alt="Avatar" />

                    <div class="text-sm min-w-0">
                      <p
                        class="text-gray-900 dark:text-white font-medium truncate"
                      >
                        {{ userData.login }}
                      </p>
                      <p class="text-gray-500 dark:text-gray-400 truncate">
                        {{ userData.name }}
                      </p>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
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
                      @click="
                        selectedUser = userData.login;
                        isInviteModalOpen = true;
                      "
                    />
                  </div>
                </div>
              </UCard>
            </div>
          </UCard>
        </UDashboardSection>
        <UDashboardModal
          v-model="isInviteModalOpen"
          title="Add member"
          description="Add new member by github username"
          :ui="{ width: 'sm:max-w-md' }"
        >
          <HunterCreate
            @close="
              isInviteModalOpen = false;
              selectedUser = '';
            "
            :preselectedUser="selectedUser"
          />
        </UDashboardModal>
      </UDashboardPanelContent>
    </UDashboardPanel>
  </UDashboardPage>
</template>

<script setup lang="ts">
import { readContract } from "@wagmi/core";
import { Contracts } from "~/abi/contracts";
import { DevNFTABI } from "~/abi/devNft.abi";

const searchHunterInput = ref("");
const isInviteModalOpen = ref(false);
const userData = ref();
const isHunter = ref();
const selectedUser = ref("");

const searchHunter = async () => {
  console.log("searching for hunter", searchHunterInput.value);

  const data = await readContract({
    address: Contracts.DevNFT,
    abi: DevNFTABI,
    functionName: "exists",
    args: [searchHunterInput.value],
  });

  const url = `https://api.github.com/users/${searchHunterInput.value}`;
  userData.value = await fetch(url)
    .then((res) => res.json())
    .then((data) => {
      return !!data.message ? null : data;
    });

  isHunter.value = data;
};
</script>
