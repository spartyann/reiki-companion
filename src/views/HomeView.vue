<template>
  <div class="min-vh-100" style="background: #fafafa">
    <header class="home-header text-center text-white py-5 px-4">
      <img src="../assets/imgs/logo.png" alt="Logo" class="home-header__logo mb-2" />
      <h1 class="fw-bold mb-1" style="font-size: 1.75rem;">Reiki Companion</h1>
      <p class="mb-0" style="opacity: 0.9">{{ greeting }}</p>
    </header>

    <main class="p-4">
      <div class="d-flex flex-column gap-3 mx-auto" style="max-width: 480px">
        <button
          class="card border-0 shadow-sm text-start p-3 d-flex flex-row align-items-center gap-3 feature-card feature-card--active"
          @click="router.push({ name: 'music' })"
        >
          <div class="feature-icon">🎵</div>
          <div class="flex-grow-1 d-flex flex-column" style="gap: 2px">
            <span class="fw-bold">Musique de séance</span>
            <span class="text-muted" style="font-size: 0.875rem">Cloches & ambiance</span>
          </div>
          <span class="text-primary fw-bold" style="font-size: 1.5rem">›</span>
        </button>

        <div class="card border-0 shadow-sm p-3 d-flex flex-row align-items-center gap-3 feature-card opacity-50">
          <div class="feature-icon">📋</div>
          <div class="flex-grow-1 d-flex flex-column" style="gap: 2px">
            <span class="fw-bold">Fiches clients</span>
            <span class="text-muted" style="font-size: 0.875rem">Bientôt disponible</span>
          </div>
          <span class="badge rounded-pill bg-secondary-subtle text-secondary-emphasis" style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em">Bientôt</span>
        </div>

        <div class="card border-0 shadow-sm p-3 d-flex flex-row align-items-center gap-3 feature-card opacity-50">
          <div class="feature-icon">📊</div>
          <div class="flex-grow-1 d-flex flex-column" style="gap: 2px">
            <span class="fw-bold">Suivi de séances</span>
            <span class="text-muted" style="font-size: 0.875rem">Bientôt disponible</span>
          </div>
          <span class="badge rounded-pill bg-secondary-subtle text-secondary-emphasis" style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em">Bientôt</span>
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
.home-header {
  background: linear-gradient(135deg, $color-primary 0%, $color-primary-dark 100%);
}

.home-header__logo {
  width: 72px;
  height: 72px;
  object-fit: contain;
  filter: brightness(0) invert(1);
  opacity: 0.9;
  display: block;
  margin-left: auto;
  margin-right: auto;
}

.feature-icon {
  font-size: 2rem;
  line-height: 1;
  flex-shrink: 0;
}

.feature-card {
  background: #fff;
  border: none;
  width: 100%;
  cursor: default;
  border-radius: 16px;
}

.feature-card--active {
  cursor: pointer;
  border-left: 4px solid $color-primary !important;
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12) !important;
  }

  &:active {
    transform: scale(0.98);
  }
}
</style>
