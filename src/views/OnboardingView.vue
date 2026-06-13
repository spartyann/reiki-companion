<template>
  <div class="onboarding min-vh-100 d-flex flex-column overflow-hidden">
    <div class="onboarding__slides d-flex flex-grow-1" :style="trackStyle">
      <div v-for="(slide, index) in slides" :key="index" class="onboarding__slide d-flex flex-column align-items-center justify-content-center text-center px-4 py-5">
        <div class="onboarding__icon mb-4">{{ slide.icon }}</div>
        <h1 class="fw-bold mb-3 text-secondary" style="font-size: 2rem; white-space: pre-line; line-height: 1.25;">{{ slide.title }}</h1>
        <p class="text-muted lh-lg mb-0" style="font-size: 1.25rem; max-width: 360px;">{{ slide.description }}</p>
      </div>
    </div>

    <div class="d-flex flex-column align-items-center gap-4 px-4 py-5">
      <div class="d-flex gap-2">
        <span
          v-for="(_, index) in slides"
          :key="index"
          class="onboarding__dot"
          :class="{ 'onboarding__dot--active': index === current }"
        />
      </div>

      <button
        class="btn btn-primary rounded-pill fw-bold w-100 py-3"
        style="max-width: 320px; font-size: 1.25rem;"
        @click="next"
      >
        {{ isLast ? 'Commencer' : 'Suivant' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useOnboardingStore } from '../stores/onboarding'

const router = useRouter()
const onboarding = useOnboardingStore()

const slides = [
  {
    icon: '🌿',
    title: 'Bienvenue dans\nReiki Companion',
    description: 'Votre compagnon de séance dédié aux praticiens Reiki. Simple, calme, et toujours à portée de main.',
  },
  {
    icon: '🎵',
    title: 'Votre musique,\nvos séances',
    description: 'Créez des thèmes personnalisés avec la cloche et la musique de votre choix. Vos séances sonneront exactement comme vous le souhaitez.',
  },
  {
    icon: '✨',
    title: 'Concentrez-vous\nsur l\'essentiel',
    description: 'L\'app s\'occupe du timing. Vous, vous vous concentrez sur vos patients.',
  },
]

const current = ref(0)
const isLast = computed(() => current.value === slides.length - 1)

const trackStyle = computed(() => ({
  transform: `translateX(-${current.value * 100}%)`,
}))

function next() {
  if (isLast.value) {
    onboarding.complete()
    router.push({ name: 'home' })
  } else {
    current.value++
  }
}
</script>

<style scoped lang="scss">
.onboarding {
  background: linear-gradient(160deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%);
}

.onboarding__slides {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.onboarding__slide {
  min-width: 100vw;
}

.onboarding__icon {
  font-size: 5rem;
  line-height: 1;
}

.onboarding__dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: $radius-full;
  background: rgba($color-primary, 0.3);
  transition: all 0.3s ease;

  &--active {
    background: $color-primary;
    width: 24px;
  }
}
</style>
