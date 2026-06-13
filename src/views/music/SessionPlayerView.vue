<template>
  <div class="session-player min-vh-100 d-flex flex-column">
    <AppHeader :title="theme?.name ?? 'Séance'" :show-back="!isPlaying" />

    <main class="flex-grow-1 d-flex flex-column align-items-center justify-content-center p-4 gap-5">
      <!-- Audio non généré -->
      <div v-if="!theme?.generatedAudioPath" class="text-center d-flex flex-column align-items-center gap-4">
        <div style="font-size: 3.5rem">⚠️</div>
        <p class="h5 fw-bold text-secondary mb-0">Audio non généré</p>
        <p class="text-muted mb-0">Générez l'audio du thème avant de lancer la séance.</p>
        <button class="btn btn-primary rounded-pill fw-bold px-5 py-2" @click="router.back()">
          ← Retour
        </button>
      </div>

      <!-- Lecteur -->
      <template v-else>
        <!-- Anneaux de pulse -->
        <div class="pulse-ring">
          <div
            class="pulse-wave"
            :class="{ 'pulse-wave--active': isPlaying }"
          />
          <div
            class="pulse-wave"
            :class="{ 'pulse-wave--active': isPlaying }"
          />
          <div
            class="pulse-wave"
            :class="{ 'pulse-wave--active': isPlaying }"
          />
          <div
            class="pulse-center"
            :class="{ 'pulse-center--bell': bellFlash }"
          >
            🔔
          </div>
        </div>

        <!-- Minuteur -->
        <div class="text-center">
          <div class="timer-elapsed">{{ formatTime(currentTime) }}</div>
          <div class="text-muted small mt-1">
            {{ formatTime(totalDuration - currentTime) }} restantes
          </div>
        </div>

        <!-- Barre de progression -->
        <div class="w-100" style="max-width: 320px">
          <div class="progress" style="height: 6px; background: rgba(49,213,61,0.2)">
            <div
              class="progress-bar bg-primary"
              role="progressbar"
              :style="{ width: progress + '%' }"
            />
          </div>
        </div>

        <!-- Info chips -->
        <div class="d-flex gap-2 flex-wrap justify-content-center">
          <span class="player-chip badge rounded-pill">🔔 {{ bellsRung }} sonnerie{{ bellsRung !== 1 ? 's' : '' }}</span>
          <span v-if="theme.musicAssetId" class="player-chip badge rounded-pill">🎵 Musique active</span>
        </div>

        <!-- Contrôles -->
        <div class="d-flex align-items-center gap-4">
          <button class="btn-stop btn border-0 rounded-circle d-flex align-items-center justify-content-center" @click="stop">
            ⏹
          </button>
          <button class="btn-play btn btn-primary rounded-circle d-flex align-items-center justify-content-center" @click="togglePlay">
            {{ isPlaying ? '⏸' : '▶' }}
          </button>
        </div>
      </template>
    </main>

    <!-- Fin de séance -->
    <div
      v-if="sessionEnded"
      class="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style="background: rgba(0,0,0,0.55); z-index: 50"
    >
      <div class="card border-0 rounded-3 p-4 text-center d-flex flex-column align-items-center gap-3" style="max-width: 300px; width: 90%">
        <div style="font-size: 3rem">✨</div>
        <p class="h5 fw-bold text-secondary mb-0">Séance terminée</p>
        <p class="text-muted small mb-0">Durée : {{ formatTime(totalDuration) }}</p>
        <button class="btn btn-primary rounded-pill fw-bold px-4 py-2" @click="router.back()">
          Retour aux thèmes
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
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

<style scoped lang="scss">
.session-player {
  background: linear-gradient(160deg, #f0fdf4 0%, #dcfce7 60%, #bbf7d0 100%);
}

// Pulse ring animation
.pulse-ring {
  position: relative;
  width: 160px;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pulse-wave {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 3px solid $color-primary;
  opacity: 0;

  &--active {
    animation: player-pulse 2s ease-out infinite;
  }

  &:nth-child(2) { animation-delay: 0.66s; }
  &:nth-child(3) { animation-delay: 1.33s; }
}

.pulse-center {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: $color-primary;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  box-shadow: 0 4px 20px rgba($color-primary, 0.4);
  transition: transform 0.1s ease;
  position: relative;
  z-index: 1;

  &--bell {
    animation: player-bell-ring 0.5s ease;
  }
}

// Timer
.timer-elapsed {
  font-family: 'Bona Nova', serif;
  font-size: 3rem;
  font-weight: 700;
  color: $color-secondary;
  letter-spacing: 2px;
  line-height: 1;
}

// Info chips
.player-chip {
  background: rgba(255, 255, 255, 0.7);
  color: #166534;
  backdrop-filter: blur(4px);
  font-weight: 400;
  font-size: 0.875rem;
}

// Control buttons
.btn-play {
  width: 72px;
  height: 72px;
  font-size: 1.75rem;
  box-shadow: 0 4px 16px rgba($color-primary, 0.45);

  &:active { transform: scale(0.93); }
}

.btn-stop {
  width: 52px;
  height: 52px;
  background: #fff;
  color: #dc2626;
  font-size: 1.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &:hover { background: #fef2f2; }
  &:active { transform: scale(0.93); }
}

@keyframes player-pulse {
  0%   { transform: scale(1);   opacity: 0.6; }
  100% { transform: scale(1.9); opacity: 0; }
}

@keyframes player-bell-ring {
  0%   { transform: scale(1); }
  30%  { transform: scale(1.2); }
  60%  { transform: scale(0.95); }
  100% { transform: scale(1); }
}
</style>
