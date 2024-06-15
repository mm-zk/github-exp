<template>
    <div>Hello Bounty  and number {{ props.prNumber }}</div>
    <div> We are  {{ props.repo }} </div>
</template>

<script lang="ts" setup>
const props = defineProps(['repo', 'prNumber'])

// TODO: here we should query the contract to see if there is any bounty for given repo & pr.


</script>