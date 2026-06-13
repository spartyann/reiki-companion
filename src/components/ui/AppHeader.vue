<template>
  <header class="app-header d-flex align-items-center gap-2 px-4">
    <button v-if="showBack" class="btn p-1 border-0 text-white app-header__back" @click="router.back()">
      <span class="app-header__back-icon">‹</span>
    </button>
    <h2 class="mb-0 flex-grow-1 fw-bold fs-5 text-white">{{ title }}</h2>
    <div class="d-flex align-items-center gap-2 flex-shrink-0">
      <slot name="right" />
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

defineProps<{
  title: string
  showBack?: boolean
}>()

const router = useRouter()
</script>

<style scoped lang="scss">
.app-header {
  background: linear-gradient(135deg, $color-primary 0%, $color-primary-dark 100%);
  min-height: 60px;
}
.app-header__back {
  background: none;
  flex-shrink: 0;
}
.app-header__back-icon {
  font-size: 2rem;
  font-weight: 300;
  line-height: 1;
}
</style>
