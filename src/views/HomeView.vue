<template>
  <div class="home">
    <header class="home__header">
      <img src="../assets/imgs/logo.png" alt="Logo" class="home__logo" />
      <h1 class="home__title">Reiki Companion</h1>
      <p class="home__greeting">{{ greeting }}</p>
    </header>

    <main class="home__main">
      <div class="home__grid">
        <button class="feature-card feature-card--active" @click="router.push({ name: 'music' })">
          <div class="feature-card__icon">🎵</div>
          <div class="feature-card__body">
            <span class="feature-card__title">Musique de séance</span>
            <span class="feature-card__subtitle">Cloches & ambiance</span>
          </div>
          <span class="feature-card__arrow">›</span>
        </button>

        <div class="feature-card feature-card--soon">
          <div class="feature-card__icon">📋</div>
          <div class="feature-card__body">
            <span class="feature-card__title">Fiches clients</span>
            <span class="feature-card__subtitle">Bientôt disponible</span>
          </div>
          <span class="feature-card__badge">Bientôt</span>
        </div>

        <div class="feature-card feature-card--soon">
          <div class="feature-card__icon">📊</div>
          <div class="feature-card__body">
            <span class="feature-card__title">Suivi de séances</span>
            <span class="feature-card__subtitle">Bientôt disponible</span>
          </div>
          <span class="feature-card__badge">Bientôt</span>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bonjour 🌅'
  if (hour < 18) return 'Bon après-midi 🌿'
  return 'Bonsoir 🌙'
})
</script>

<style src="../scss/views/home.scss" scoped lang="scss" />
