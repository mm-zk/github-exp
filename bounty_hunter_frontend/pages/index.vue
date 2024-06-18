<template>
  <div>
    <h1>GitHub ZKSync</h1>

    <Connect />

    <Connected>
    <Github :repo=repo />
    </Connected>
  </div>
</template>

<script lang="ts" setup>
useWagmi();
const repo = import.meta.env.VITE_API_TARGET_REPO;
</script>
