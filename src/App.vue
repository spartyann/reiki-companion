<template>
  <div class="app">
    <h1>{{ title }}</h1>
    <p>Bienvenue dans ton app Reiki</p>
    <button class="btn btn-primary" @click="count++">Clics : {{ count }}</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const title = ref('Reiki Companion');
const count = ref(0);
</script>

<style scoped>
.app {
  text-align: center;
  padding: 2rem;
}
</style>
