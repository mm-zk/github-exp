<template>
  <div>
    <h1>GitHub ZKSync</h1>

    <Connect />

    <Connected>
    <Github repo="matter-labs/zksync-era"/>
    </Connected>
  </div>
</template>

<script lang="ts" setup>
useWagmi();
</script>
