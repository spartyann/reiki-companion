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

<style src="../../scss/components/ui/app-header.scss" scoped lang="scss" />
