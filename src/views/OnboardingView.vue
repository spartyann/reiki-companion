<template>
  <div class="onboarding">
    <div class="onboarding__slides" :style="trackStyle">
      <div v-for="(slide, index) in slides" :key="index" class="onboarding__slide">
        <div class="onboarding__slide-icon">{{ slide.icon }}</div>
        <h1 class="onboarding__title">{{ slide.title }}</h1>
        <p class="onboarding__description">{{ slide.description }}</p>
      </div>
    </div>

    <div class="onboarding__footer">
      <div class="onboarding__dots">
        <span
          v-for="(_, index) in slides"
          :key="index"
          class="onboarding__dot"
          :class="{ 'onboarding__dot--active': index === current }"
        />
      </div>

      <button class="onboarding__btn" @click="next">
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
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  overflow: hidden;
  background: linear-gradient(160deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%);
}

.onboarding__slides {
  display: flex;
  flex: 1;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.onboarding__slide {
  min-width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-xl $spacing-lg;
  text-align: center;
}

.onboarding__slide-icon {
  font-size: 5rem;
  margin-bottom: $spacing-xl;
  line-height: 1;
}

.onboarding__title {
  font-family: 'Bona Nova', serif;
  font-size: 2rem;
  font-weight: 700;
  color: $color-secondary;
  margin-bottom: $spacing-md;
  white-space: pre-line;
  line-height: 1.25;
}

.onboarding__description {
  font-family: 'Nunito', sans-serif;
  font-size: $font-size-lg;
  color: $color-text-muted;
  max-width: 360px;
  line-height: 1.6;
}

.onboarding__footer {
  padding: $spacing-xl $spacing-lg;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-lg;
}

.onboarding__dots {
  display: flex;
  gap: $spacing-sm;
}

.onboarding__dot {
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

.onboarding__btn {
  width: 100%;
  max-width: 320px;
  padding: 14px $spacing-xl;
  background: $color-primary;
  color: #fff;
  border: none;
  border-radius: $radius-full;
  font-family: 'Nunito', sans-serif;
  font-size: $font-size-lg;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.1s ease;

  &:hover {
    background: $color-primary-dark;
  }

  &:active {
    transform: scale(0.97);
  }
}
</style>
