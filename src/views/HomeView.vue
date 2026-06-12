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

<style scoped lang="scss">
.home {
  min-height: 100vh;
  background: #fafafa;
}

.home__header {
  background: linear-gradient(135deg, $color-primary 0%, $color-primary-dark 100%);
  padding: $spacing-xl $spacing-lg;
  text-align: center;
  color: #fff;
}

.home__logo {
  width: 72px;
  height: 72px;
  object-fit: contain;
  margin-bottom: $spacing-sm;
  filter: brightness(0) invert(1);
  opacity: 0.9;
}

.home__title {
  font-family: 'Bona Nova', serif;
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 $spacing-xs;
  color: #fff;
}

.home__greeting {
  font-family: 'Nunito', sans-serif;
  font-size: $font-size-base;
  margin: 0;
  opacity: 0.9;
}

.home__main {
  padding: $spacing-lg;
}

.home__grid {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
  max-width: 480px;
  margin: 0 auto;
}

.feature-card {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-md;
  border-radius: $radius-lg;
  background: #fff;
  border: none;
  text-align: left;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  width: 100%;
  cursor: default;

  &--active {
    cursor: pointer;
    border-left: 4px solid $color-primary;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    }

    &:active {
      transform: scale(0.98);
    }
  }

  &--soon {
    opacity: 0.55;
  }
}

.feature-card__icon {
  font-size: 2rem;
  line-height: 1;
  flex-shrink: 0;
}

.feature-card__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.feature-card__title {
  font-family: 'Nunito', sans-serif;
  font-size: $font-size-base;
  font-weight: 700;
  color: $color-text;
}

.feature-card__subtitle {
  font-family: 'Nunito', sans-serif;
  font-size: $font-size-sm;
  color: $color-text-muted;
}

.feature-card__arrow {
  font-size: 1.5rem;
  color: $color-primary;
  font-weight: 700;
  flex-shrink: 0;
}

.feature-card__badge {
  font-family: 'Nunito', sans-serif;
  font-size: 0.7rem;
  font-weight: 700;
  background: #e5e7eb;
  color: #6b7280;
  padding: 3px 8px;
  border-radius: $radius-full;
  flex-shrink: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
</style>
