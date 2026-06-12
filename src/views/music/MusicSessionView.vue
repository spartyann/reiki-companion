<template>
  <div class="music-session">
    <AppHeader title="Musique de séance" :show-back="true">
      <template #right>
        <StorageIndicator :bytes="themesStore.totalStorageBytes" />
      </template>
    </AppHeader>

    <main class="music-session__main">
      <div v-if="themesStore.themes.length === 0" class="music-session__empty">
        <div class="music-session__empty-icon">🎵</div>
        <p class="music-session__empty-title">Aucun thème créé</p>
        <p class="music-session__empty-sub">
          Créez votre premier thème pour préparer une séance avec cloches et musique d'ambiance.
        </p>
        <button class="music-session__create-btn" @click="router.push({ name: 'music-new' })">
          + Créer un thème
        </button>
      </div>

      <div v-else class="music-session__list">
        <ThemeCard
          v-for="theme in themesStore.themes"
          :key="theme.id"
          :theme="theme"
          :is-generating="generatingId === theme.id"
          :generate-progress="generateProgress"
          @play="router.push({ name: 'music-play', params: { id: $event } })"
          @generate="handleGenerate"
          @edit="router.push({ name: 'music-edit', params: { id: $event } })"
          @delete="handleDelete"
        />
      </div>
    </main>

    <button
      v-if="themesStore.themes.length > 0"
      class="music-session__fab"
      @click="router.push({ name: 'music-new' })"
    >
      +
    </button>

    <!-- Generation overlay -->
    <div v-if="generatingId" class="music-session__overlay">
      <div class="music-session__overlay-card">
        <div class="music-session__overlay-spinner" />
        <p class="music-session__overlay-title">Génération de l'audio…</p>
        <p class="music-session__overlay-sub">{{ generateProgress }}%</p>
        <div class="music-session__progress">
          <div class="music-session__progress-bar" :style="{ width: generateProgress + '%' }" />
        </div>
        <p class="music-session__overlay-hint">Cela peut prendre quelques secondes.</p>
      </div>
    </div>

    <!-- Error toast -->
    <div v-if="errorMessage" class="music-session__toast music-session__toast--error">
      ⚠️ {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useThemesStore } from '../../stores/themes'
import { useAudioGenerator } from '../../composables/useAudioGenerator'
import { useFilesystem } from '../../composables/useFilesystem'
import AppHeader from '../../components/ui/AppHeader.vue'
import StorageIndicator from '../../components/music/StorageIndicator.vue'
import ThemeCard from '../../components/music/ThemeCard.vue'

const router = useRouter()
const themesStore = useThemesStore()
const { generateGongTrack } = useAudioGenerator()
const { deleteAudioFile } = useFilesystem()

const generatingId = ref<string | null>(null)
const generateProgress = ref(0)
const errorMessage = ref<string | null>(null)

async function handleGenerate(themeId: string) {
  const theme = themesStore.getTheme(themeId)
  if (!theme) return

  // Delete existing audio if present
  if (theme.generatedAudioPath) {
    await deleteAudioFile(theme.generatedAudioPath)
    themesStore.clearGeneratedAudio(themeId)
  }

  generatingId.value = themeId
  generateProgress.value = 0
  errorMessage.value = null

  try {
    const result = await generateGongTrack(theme, (p) => {
      generateProgress.value = Math.round(p)
    })
    themesStore.setGeneratedAudio(themeId, result.path, result.size)
  } catch (err) {
    console.error(err)
    errorMessage.value = err instanceof Error ? err.message : 'Erreur lors de la génération audio.'
    setTimeout(() => { errorMessage.value = null }, 5000)
  } finally {
    generatingId.value = null
    generateProgress.value = 0
  }
}

async function handleDelete(themeId: string) {
  if (!confirm('Supprimer ce thème ?')) return
  const theme = themesStore.getTheme(themeId)
  if (theme?.generatedAudioPath) {
    await deleteAudioFile(theme.generatedAudioPath)
  }
  themesStore.deleteTheme(themeId)
}
</script>

<style src="../../scss/views/music/music-session.scss" scoped lang="scss" />
