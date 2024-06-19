<template>
  <div>
    <UButton
      v-if="account.isConnected"
      @click="disconnect"
      color="primary"
      variant="solid"
    >
      Disconnect from {{ account.connector?.name }}
    </UButton>

    <template v-else>
      <UDropdown
        :items="items"
        mode="hover"
        :popper="{ placement: 'bottom-start' }"
      >
        <UButton
          color="gray"
          label="Connect Wallet"
          trailing-icon="i-heroicons-chevron-down-20-solid"
        />
      </UDropdown>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { connect, disconnect, getConfig } from "@wagmi/core";

const config = getConfig();
const { account } = storeToRefs(useWagmi());

const items = computed(() => {
  return [
    config.connectors.map((connector) => {
      return {
        label: connector.name,
        click: () => connect({ connector }),
      };
    }),
  ];
});
</script>
