import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useSessionStore = defineStore('session', () => {
  const sessionCount = ref(0);
  const lastSessionDate = ref<string | null>(null);

  const hasSession = computed(() => sessionCount.value > 0);

  function startSession() {
    sessionCount.value++;
    lastSessionDate.value = new Date().toLocaleDateString('fr-FR');
  }

  function reset() {
    sessionCount.value = 0;
    lastSessionDate.value = null;
  }

  return { sessionCount, lastSessionDate, hasSession, startSession, reset };
});
