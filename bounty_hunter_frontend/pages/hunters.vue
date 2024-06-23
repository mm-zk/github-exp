<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar title="Bounty Hunters" />
      <UDashboardPanelContent>
        <UDashboardSection
          title="My Profile"
          description="Manage your profile for the bounty hunter program."
          orientation="horizontal"
          class="px-4 mt-6"
        >
          <template #icon>
            <UIcon class="w-12 h-12" name="game-icons:samus-helmet" dynamic />
          </template>
          <HunterProfile />
        </UDashboardSection>
        <UDashboardSection
          title="View Members"
          description="Manage the users that are part of the bounty hunting program."
          orientation="horizontal"
          class="px-4 mt-6"
        >
          <template #icon>
            <UIcon
              class="w-12 h-12"
              name="heroicons:user-group-20-solid"
              dynamic
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

            <div v-if="userData" class="m-4">
              <HunterShow :ghUser="userData" @createHunter="createHunter" showShowButton=true />
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
              searchHunter();
            "
            :preselectedUser="selectedUser"
          />
        </UDashboardModal>
      </UDashboardPanelContent>
    </UDashboardPanel>
  </UDashboardPage>
</template>

<script setup lang="ts">
const searchHunterInput = ref("");
const isInviteModalOpen = ref(false);
const userData = ref(null);
const selectedUser = ref("");

const searchHunter = async () => {
  const url = `https://api.github.com/users/${searchHunterInput.value}`;
  userData.value = await fetch(url)
    .then((res) => res.json())
    .then((data) => {
      return !!data.message ? null : data;
    });
};

const mappingAddress = import.meta.env.VITE_API_MAPPING_URL;

const createHunter = async (ghUser: string) => {
  // Send user to github to add their address there.
  window.location.href = mappingAddress;

  //isInviteModalOpen.value = true;
  //selectedUser.value = ghUser;
};
</script>
