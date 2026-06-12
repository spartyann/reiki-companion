import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEY = 'reiki_onboarding_completed'

export const useOnboardingStore = defineStore('onboarding', () => {
  const isCompleted = ref(localStorage.getItem(STORAGE_KEY) === 'true')

  function complete() {
    isCompleted.value = true
    localStorage.setItem(STORAGE_KEY, 'true')
  }

  function reset() {
    isCompleted.value = false
    localStorage.removeItem(STORAGE_KEY)
  }

  return { isCompleted, complete, reset }
})
