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

<style src="../scss/views/onboarding.scss" scoped lang="scss" />
