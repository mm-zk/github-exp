<template>
  <span
    :class="{
      'text-amber-700': prState === 'closed',
      'text-green-700': prState === 'open',
      'text-gray-500': prState === 'draft',
      'text-purple-700': prState === 'merged',
    }"
    class="mr-2"
  >
    <UIcon
      v-if="prState === 'open' || prState === 'draft'"
      name="octicon:git-pull-request-16"
      dynamic
    />
    <UIcon
      v-if="prState === 'closed'"
      name="octicon:git-pull-request-closed-16"
      dynamic
    />
    <UIcon v-if="prState === 'merged'" name="octicon:git-merge" dynamic />
  </span>
</template>

<script setup lang="ts">
const props = defineProps(["pr"]);

const prState = computed(() => {
  if (props.pr.state === "open") {
    if (props.pr.draft) {
      return "draft";
    } else {
      return "open";
    }
  } else {
    if (!!props.pr.merged_at) {
      return "merged";
    } else {
      return "closed";
    }
  }
});
</script>
