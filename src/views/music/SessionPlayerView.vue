<template>
  <div class="session-player">
    <AppHeader :title="theme?.name ?? 'Séance'" :show-back="!isPlaying" />

    <main class="session-player__main">
      <!-- Audio non généré -->
      <div v-if="!theme?.generatedAudioPath" class="session-player__no-audio">
        <div class="session-player__no-audio-icon">⚠️</div>
        <p class="session-player__no-audio-title">Audio non généré</p>
        <p class="session-player__no-audio-sub">
          Générez l'audio du thème avant de lancer la séance.
        </p>
        <button class="session-player__back-btn" @click="router.back()">
          ← Retour
        </button>
      </div>

      <!-- Lecteur -->
      <template v-else>
        <!-- Anneaux de pulse -->
        <div class="session-player__pulse-ring">
          <div
            class="session-player__pulse-wave"
            :class="{ 'session-player__pulse-wave--active': isPlaying }"
          />
          <div
            class="session-player__pulse-wave"
            :class="{ 'session-player__pulse-wave--active': isPlaying }"
          />
          <div
            class="session-player__pulse-wave"
            :class="{ 'session-player__pulse-wave--active': isPlaying }"
          />
          <div
            class="session-player__pulse-center"
            :class="{ 'session-player__pulse-center--bell': bellFlash }"
          >
            🔔
          </div>
        </div>

        <!-- Minuteur -->
        <div class="session-player__timer">
          <div class="session-player__time-elapsed">{{ formatTime(currentTime) }}</div>
          <div class="session-player__time-remaining">
            {{ formatTime(totalDuration - currentTime) }} restantes
          </div>
        </div>

        <!-- Barre de progression -->
        <div class="session-player__progress-wrap">
          <div class="session-player__progress-track">
            <div
              class="session-player__progress-fill"
              :style="{ width: progress + '%' }"
            />
          </div>
        </div>

        <!-- Info chips -->
        <div class="session-player__info">
          <span class="session-player__chip">🔔 {{ bellsRung }} sonnerie{{ bellsRung !== 1 ? 's' : '' }}</span>
          <span v-if="theme.musicAssetId" class="session-player__chip">🎵 Musique active</span>
        </div>

        <!-- Contrôles -->
        <div class="session-player__controls">
          <button class="session-player__btn session-player__btn--stop" @click="stop">
            ⏹
          </button>
          <button class="session-player__btn session-player__btn--play" @click="togglePlay">
            {{ isPlaying ? '⏸' : '▶' }}
          </button>
        </div>
      </template>
    </main>

    <!-- Fin de séance -->
    <div v-if="sessionEnded" class="session-player__end-overlay">
      <div class="session-player__end-card">
        <div class="session-player__end-icon">✨</div>
        <p class="session-player__end-title">Séance terminée</p>
        <p class="session-player__end-sub">Durée : {{ formatTime(totalDuration) }}</p>
        <button class="session-player__end-btn" @click="router.back()">
          Retour aux thèmes
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { useThemesStore } from '../../stores/themes'
import { BELL_ASSETS, MUSIC_ASSETS } from '../../types'
import AppHeader from '../../components/ui/AppHeader.vue'

const route = useRoute()
const router = useRouter()
const themesStore = useThemesStore()

const theme = computed(() => themesStore.getTheme(route.params.id as string))

const isPlaying = ref(false)
const currentTime = ref(0)
const bellsRung = ref(0)
const bellFlash = ref(false)
const sessionEnded = ref(false)

let gongAudio: HTMLAudioElement | null = null
let musicAudio: HTMLAudioElement | null = null
let blobUrl: string | null = null
let rafId: number | null = null

const totalDuration = computed(() =>
  (theme.value?.sessionDurationMinutes ?? 0) * 60
)

const progress = computed(() =>
  totalDuration.value > 0 ? (currentTime.value / totalDuration.value) * 100 : 0
)

const bellInterval = computed(() => theme.value?.bellIntervalSeconds ?? 300)

// ─── Audio setup ─────────────────────────────────────────────────────────────

async function buildBlobUrl(path: string): Promise<string> {
  const result = await Filesystem.readFile({ path, directory: Directory.Data })
  const base64 = typeof result.data === 'string' ? result.data : ''
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return URL.createObjectURL(new Blob([bytes], { type: 'audio/mpeg' }))
}

function getMusicUrl(): string | null {
  const t = theme.value
  if (!t || !t.musicAssetId) return null
  if (t.musicAssetId === 'custom') return t.musicCustomPath ?? null
  return MUSIC_ASSETS.find(a => a.id === t.musicAssetId)?.path ?? null
}

async function setupAudio() {
  if (!theme.value?.generatedAudioPath) return

  blobUrl = await buildBlobUrl(theme.value.generatedAudioPath)
  gongAudio = new Audio(blobUrl)
  gongAudio.addEventListener('ended', onGongEnded)
  gongAudio.addEventListener('error', (e) => console.error('Gong audio error', e))

  const musicUrl = getMusicUrl()
  if (musicUrl) {
    musicAudio = new Audio(musicUrl)
    musicAudio.loop = true
    musicAudio.volume = 0.6
  }
}

function startRaf() {
  const tick = () => {
    if (!gongAudio || !isPlaying.value) return
    currentTime.value = gongAudio.currentTime
    trackBells()
    rafId = requestAnimationFrame(tick)
  }
  rafId = requestAnimationFrame(tick)
}

function stopRaf() {
  if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null }
}

// ─── Bell tracking ────────────────────────────────────────────────────────────

let lastBellIndex = -1

function trackBells() {
  const t = currentTime.value
  const interval = bellInterval.value
  const currentBellIndex = Math.floor(t / interval)
  if (currentBellIndex > lastBellIndex) {
    lastBellIndex = currentBellIndex
    bellsRung.value = currentBellIndex + 1
    triggerBellFlash()
  }
}

function triggerBellFlash() {
  bellFlash.value = true
  setTimeout(() => { bellFlash.value = false }, 600)
}

// ─── Controls ────────────────────────────────────────────────────────────────

async function togglePlay() {
  if (!gongAudio) return
  if (isPlaying.value) {
    gongAudio.pause()
    musicAudio?.pause()
    stopRaf()
    isPlaying.value = false
  } else {
    await gongAudio.play()
    if (musicAudio) {
      try { await musicAudio.play() } catch { /* music is optional */ }
    }
    isPlaying.value = true
    startRaf()
  }
}

function stop() {
  if (!gongAudio) return
  gongAudio.pause()
  gongAudio.currentTime = 0
  musicAudio?.pause()
  if (musicAudio) musicAudio.currentTime = 0
  isPlaying.value = false
  currentTime.value = 0
  bellsRung.value = 0
  lastBellIndex = -1
  stopRaf()
}

function onGongEnded() {
  isPlaying.value = false
  stopRaf()
  musicAudio?.pause()
  currentTime.value = totalDuration.value
  sessionEnded.value = true
}

// ─── Lifecycle ───────────────────────────────────────────────────────────────

onMounted(setupAudio)

onUnmounted(() => {
  stopRaf()
  gongAudio?.pause()
  musicAudio?.pause()
  gongAudio = null
  musicAudio = null
  if (blobUrl) { URL.revokeObjectURL(blobUrl); blobUrl = null }
})

// ─── Utils ────────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds))
  const m = Math.floor(s / 60)
  const rem = s % 60
  return `${String(m).padStart(2, '0')}:${String(rem).padStart(2, '0')}`
}
</script>

<style src="../../scss/views/music/session-player.scss" scoped lang="scss" />
