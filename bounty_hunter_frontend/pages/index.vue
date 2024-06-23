<template>
  <div>

    <ULandingCard title="PR Bounties" description="Get rewarded for PR reviews" color="primary">
      Connect your wallet to create & claim bounties or just browse on the left.
      <Connect />

      Account connected: {{ account.isConnected }} <br>

      Wallet Network: {{ network.chain }} <br>

      Current chain: {{ selectedChain.name }}

      <Connected>
      </Connected>
    </ULandingCard>

  </div>
</template>

<script lang="ts" setup>
import { getPublicClient } from '@wagmi/core';

const { account, network} = storeToRefs(useWagmi());

const selectedChain = getPublicClient().chain;
</script>
