import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Theme, ThemeFormData } from '../types'
import { BELL_ASSETS, BELL_INTERVAL_OPTIONS } from '../types'

const STORAGE_KEY = 'reiki_themes'

function loadThemes(): Theme[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function persist(themes: Theme[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(themes))
}

export const useThemesStore = defineStore('themes', () => {
  const themes = ref<Theme[]>(loadThemes())

  const totalStorageBytes = computed(() =>
    themes.value.reduce((sum, t) => sum + (t.generatedAudioSize ?? 0), 0)
  )

  function createTheme(data: ThemeFormData): Theme {
    const now = Date.now()
    const theme: Theme = {
      ...data,
      id: crypto.randomUUID(),
      generatedAudioPath: null,
      generatedAudioSize: null,
      generatedAt: null,
      createdAt: now,
      updatedAt: now,
    }
    themes.value.push(theme)
    persist(themes.value)
    return theme
  }

  function updateTheme(id: string, data: Partial<ThemeFormData>) {
    const idx = themes.value.findIndex(t => t.id === id)
    if (idx === -1) return
    themes.value[idx] = {
      ...themes.value[idx],
      ...data,
      updatedAt: Date.now(),
    }
    persist(themes.value)
  }

  function setGeneratedAudio(id: string, path: string, size: number) {
    const idx = themes.value.findIndex(t => t.id === id)
    if (idx === -1) return
    themes.value[idx] = {
      ...themes.value[idx],
      generatedAudioPath: path,
      generatedAudioSize: size,
      generatedAt: Date.now(),
      updatedAt: Date.now(),
    }
    persist(themes.value)
  }

  function clearGeneratedAudio(id: string) {
    const idx = themes.value.findIndex(t => t.id === id)
    if (idx === -1) return
    themes.value[idx] = {
      ...themes.value[idx],
      generatedAudioPath: null,
      generatedAudioSize: null,
      generatedAt: null,
      updatedAt: Date.now(),
    }
    persist(themes.value)
  }

  function deleteTheme(id: string) {
    themes.value = themes.value.filter(t => t.id !== id)
    persist(themes.value)
  }

  function getTheme(id: string): Theme | undefined {
    return themes.value.find(t => t.id === id)
  }

  function getBellLabel(theme: Theme): string {
    if (theme.bellAssetId === 'custom') return 'Bell personnalisé'
    const asset = BELL_ASSETS.find(a => a.id === theme.bellAssetId)
    return asset?.name ?? 'Bell inconnu'
  }

  function getIntervalLabel(theme: Theme): string {
    const opt = BELL_INTERVAL_OPTIONS.find(o => o.value === theme.bellIntervalSeconds)
    return opt?.label ?? `${theme.bellIntervalSeconds}s`
  }

  return {
    themes,
    totalStorageBytes,
    createTheme,
    updateTheme,
    setGeneratedAudio,
    clearGeneratedAudio,
    deleteTheme,
    getTheme,
    getBellLabel,
    getIntervalLabel,
  }
})
