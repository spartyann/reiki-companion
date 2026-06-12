<template>
  <header class="app-header">
    <button v-if="showBack" class="app-header__back" @click="router.back()">
      <span class="app-header__back-icon">‹</span>
    </button>
    <h2 class="app-header__title">{{ title }}</h2>
    <div class="app-header__right">
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
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-md $spacing-lg;
  background: linear-gradient(135deg, $color-primary 0%, $color-primary-dark 100%);
  color: #fff;
  min-height: 60px;
}

.app-header__back {
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.app-header__back-icon {
  font-size: 2rem;
  font-weight: 300;
  line-height: 1;
}

.app-header__title {
  font-family: 'Bona Nova', serif;
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  flex: 1;
  color: #fff;
}

.app-header__right {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  flex-shrink: 0;
}
</style>
