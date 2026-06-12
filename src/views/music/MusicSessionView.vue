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

<style scoped lang="scss">
.music-session {
  min-height: 100vh;
  background: #fafafa;
  display: flex;
  flex-direction: column;
}

.music-session__main {
  flex: 1;
  padding: $spacing-lg;
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
}

// Empty state
.music-session__empty {
  text-align: center;
  padding: $spacing-xl $spacing-lg;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-md;
}

.music-session__empty-icon {
  font-size: 4rem;
}

.music-session__empty-title {
  font-family: 'Bona Nova', serif;
  font-size: 1.25rem;
  font-weight: 700;
  color: $color-secondary;
  margin: 0;
}

.music-session__empty-sub {
  font-family: 'Nunito', sans-serif;
  font-size: $font-size-base;
  color: $color-text-muted;
  max-width: 300px;
  margin: 0;
  line-height: 1.6;
}

.music-session__create-btn {
  padding: 12px $spacing-xl;
  background: $color-primary;
  color: #fff;
  border: none;
  border-radius: $radius-full;
  font-family: 'Nunito', sans-serif;
  font-size: $font-size-base;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: $color-primary-dark;
  }
}

// List
.music-session__list {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

// FAB
.music-session__fab {
  position: fixed;
  bottom: $spacing-xl;
  right: $spacing-xl;
  width: 56px;
  height: 56px;
  background: $color-primary;
  color: #fff;
  border: none;
  border-radius: 50%;
  font-size: 1.75rem;
  line-height: 1;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  transition: background 0.2s, transform 0.1s;

  &:hover {
    background: $color-primary-dark;
  }

  &:active {
    transform: scale(0.93);
  }
}

// Generation overlay
.music-session__overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.music-session__overlay-card {
  background: #fff;
  border-radius: $radius-lg;
  padding: $spacing-xl;
  max-width: 320px;
  width: 90%;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-md;
}

.music-session__overlay-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #dcfce7;
  border-top-color: $color-primary;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.music-session__overlay-title {
  font-family: 'Bona Nova', serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: $color-secondary;
  margin: 0;
}

.music-session__overlay-sub {
  font-family: 'Nunito', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: $color-primary;
  margin: 0;
}

.music-session__progress {
  width: 100%;
  height: 6px;
  background: #e5e7eb;
  border-radius: $radius-full;
  overflow: hidden;
}

.music-session__progress-bar {
  height: 100%;
  background: $color-primary;
  transition: width 0.3s ease;
}

.music-session__overlay-hint {
  font-family: 'Nunito', sans-serif;
  font-size: $font-size-sm;
  color: $color-text-muted;
  margin: 0;
}

// Toast
.music-session__toast {
  position: fixed;
  bottom: $spacing-lg;
  left: 50%;
  transform: translateX(-50%);
  padding: $spacing-sm $spacing-md;
  border-radius: $radius-lg;
  font-family: 'Nunito', sans-serif;
  font-size: $font-size-sm;
  font-weight: 600;
  white-space: nowrap;
  z-index: 200;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  &--error {
    background: #fef2f2;
    color: #dc2626;
    border: 1px solid #fecaca;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
