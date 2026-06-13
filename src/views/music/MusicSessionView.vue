<template>
  <div class="min-vh-100 d-flex flex-column" style="background: #fafafa">
    <AppHeader title="Musique de séance" :show-back="true">
      <template #right>
        <StorageIndicator :bytes="themesStore.totalStorageBytes" />
      </template>
    </AppHeader>

    <main class="flex-grow-1 p-4 w-100 mx-auto" style="max-width: 600px">
      <div v-if="themesStore.themes.length === 0" class="text-center py-5 d-flex flex-column align-items-center gap-3">
        <div style="font-size: 4rem">🎵</div>
        <p class="h5 fw-bold text-secondary mb-0">Aucun thème créé</p>
        <p class="text-muted mb-0 lh-lg" style="max-width: 300px">
          Créez votre premier thème pour préparer une séance avec cloches et musique d'ambiance.
        </p>
        <button class="btn btn-primary rounded-pill fw-bold px-5 py-2" @click="router.push({ name: 'music-new' })">
          + Créer un thème
        </button>
      </div>

      <div v-else class="d-flex flex-column gap-3">
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
      class="fab btn btn-primary rounded-circle d-flex align-items-center justify-content-center"
      @click="router.push({ name: 'music-new' })"
    >
      +
    </button>

    <!-- Generation overlay -->
    <div
      v-if="generatingId"
      class="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50"
      style="z-index: 100"
    >
      <div class="card border-0 rounded-3 p-4 text-center d-flex flex-column align-items-center gap-3" style="max-width: 320px; width: 90%">
        <div class="spinner-border text-primary" style="width: 40px; height: 40px" role="status">
          <span class="visually-hidden">Chargement…</span>
        </div>
        <p class="h6 fw-bold text-secondary mb-0">Génération de l'audio…</p>
        <p class="text-primary fw-bold mb-0" style="font-size: 1.5rem">{{ generateProgress }}%</p>
        <div class="progress w-100" style="height: 6px">
          <div class="progress-bar bg-primary" role="progressbar" :style="{ width: generateProgress + '%' }" />
        </div>
        <p class="text-muted small mb-0">Cela peut prendre quelques secondes.</p>
      </div>
    </div>

    <!-- Error toast -->
    <div
      v-if="errorMessage"
      class="position-fixed bottom-0 start-50 translate-middle-x mb-4 px-3 py-2 rounded-3 small fw-semibold"
      style="z-index: 200; white-space: nowrap; background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; box-shadow: 0 4px 12px rgba(0,0,0,0.15)"
    >
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

<style scoped lang="scss">
.fab {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 56px;
  height: 56px;
  font-size: 1.75rem;
  line-height: 1;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  transition: transform 0.1s;

  &:active {
    transform: scale(0.93);
  }
}
</style>
