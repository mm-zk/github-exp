<template>
  <div v-if="visible" class="overlay">
    <div class="dialog">
      <h2>{{ props.title }}</h2>
      <div>
        <label v-for="option in options" :key="option.id">
          <input type="checkbox"  :value="option.id">
          {{ option.name }}
        </label>
      </div>
      <input type="text" v-model="inputValue" placeholder="Enter some text">
      <button @click="confirm">Confirm</button>
      <button @click="close">Close</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps(['visible', 'options', 'title']);
const emit = defineEmits(['close', 'confirm'])


//let selectedOptions: string[] = [];
let inputValue = '';

const close = () => {
    emit('close');
};

const confirm = () => {
    emit('confirm', { inputValue: inputValue });
    close();
};



</script>

<style scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
.dialog {
  background: white;
  padding: 20px;
  border-radius: 5px;
  width: 300px;
}
</style>
