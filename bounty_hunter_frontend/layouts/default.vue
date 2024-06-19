<template>
  <UDashboardLayout>
    <UDashboardPanel
      :width="250"
      :resizable="{ min: 200, max: 300 }"
      collapsible
    >
      <UDashboardNavbar>
        <template #left>
          <Connect />
        </template>
      </UDashboardNavbar>

      <UDashboardSidebar>
        <template #header> </template>

        <UDashboardSidebarLinks :links />
      </UDashboardSidebar>
    </UDashboardPanel>

    <slot />

    <UDashboardSearch />
  </UDashboardLayout>
</template>

<script setup lang="ts">
useWagmi();

const links = [
  {
    label: "Bounty Board",
    icon: "i-heroicons-home",
    to: "/board",
  },
  {
    label: "Bounty Hunters",
    icon: "i-heroicons-user-group",
    to: "/hunters",
  },
];
</script>
