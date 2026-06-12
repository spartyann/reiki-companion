<template>
  <div class="app">
    <h1>{{ title }}</h1>
    <p>Bienvenue dans ton app Reiki</p>

    <div class="mt-3">
      <button class="btn btn-primary" @click="session.startSession()">
        Démarrer une séance
      </button>
      <p class="mt-2">
        Séances effectuées : <strong>{{ session.sessionCount }}</strong>
      </p>
      <p v-if="session.hasSession">
        Dernière séance : {{ session.lastSessionDate }}
      </p>
      <button v-if="session.hasSession" class="btn btn-outline-secondary btn-sm" @click="session.reset()">
        Réinitialiser
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useSessionStore } from './stores/session';

const title = ref('Reiki Companion');
const session = useSessionStore();
</script>

<style scoped>
.app {
  text-align: center;
  padding: 2rem;
}
</style>
