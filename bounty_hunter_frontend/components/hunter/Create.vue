<template>
  <div>
    <UFormGroup label="GitHub Username" name="username">
      <UInput
        v-model="username"
        type="text"
        placeholder="itsacoyote"
        autofocus
      />
    </UFormGroup>
    <UFormGroup label="Address" name="address" class="mt-2">
      <UInput v-model="address" type="text" placeholder="0x123..." />
    </UFormGroup>

    <div class="flex justify-end gap-3 mt-4">
      <UButton
        label="Cancel"
        color="gray"
        variant="ghost"
        @click="emit('close')"
      />
      <UButton
        label="Add"
        color="black"
        @click="addUser"
        :loading="inProgress"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { writeContract, prepareWriteContract } from "@wagmi/core";
import { Contracts } from "~/abi/contracts";
import { DevNFTABI } from "~/abi/devNft.abi";
const emit = defineEmits(["close"]);
const username = defineModel("username");
const address = defineModel("address");
const props = defineProps<{ preselectedUser: string }>();
const inProgress = ref(false);
username.value = props.preselectedUser;

const addUser = async function () {
  try {
    inProgress.value = true;
    const { request, result } = await prepareWriteContract({
      abi: DevNFTABI,
      address: Contracts.DevNFT,
      functionName: "mint",
      args: [
        address.value as `0x${string}`,
        username.value.toLowerCase() as string,
      ],
    });
    const { hash } = await writeContract(request);
    emit("close");
    username.value = "";
  } catch (e) {
    console.log(e);
  } finally {
    inProgress.value = false;
  }
};
</script>
