<template>
  <div class="card border-0 shadow-sm overflow-hidden theme-card">
    <div class="card-body p-3 border-bottom">
      <h3 class="fw-bold mb-2 theme-card__name">{{ theme.name }}</h3>
      <div class="d-flex flex-wrap gap-1">
        <span class="badge rounded-pill theme-tag">🔔 {{ store.getBellLabel(theme) }}</span>
        <span class="badge rounded-pill theme-tag">⏱ {{ store.getIntervalLabel(theme) }}</span>
        <span class="badge rounded-pill theme-tag">🕐 {{ theme.sessionDurationMinutes }} min</span>
        <span v-if="theme.musicAssetId" class="badge rounded-pill theme-tag">🎵 Musique</span>
      </div>
    </div>

    <div class="px-3 py-2 border-bottom" style="background: #fafafa">
      <div v-if="theme.generatedAudioPath" class="d-flex align-items-center gap-2">
        <span>✅</span>
        <div class="d-flex flex-column fw-semibold" style="gap: 1px; font-size: 0.875rem; color: #166534">
          <span>Audio généré</span>
          <span class="text-muted fw-normal" style="font-size: 0.75rem">{{ formattedSize }} · {{ formattedDate }}</span>
        </div>
      </div>
      <div v-else class="d-flex align-items-center gap-2 small" style="color: #92400e">
        <span>⚠️</span>
        <span>Audio non généré</span>
      </div>
    </div>

    <div class="d-flex align-items-center gap-2 px-3 py-2">
      <button
        v-if="theme.generatedAudioPath"
        class="btn btn-secondary btn-sm flex-grow-1"
        :disabled="isGenerating"
        @click="emit('play', theme.id)"
      >
        ▶ Jouer
      </button>

      <button
        class="btn btn-primary btn-sm"
        :disabled="isGenerating"
        @click="emit('generate', theme.id)"
      >
        <span v-if="isGenerating">
          <span class="spinner-custom" /> {{ generateProgress }}%
        </span>
        <span v-else>
          {{ theme.generatedAudioPath ? '↺' : '⚡ Générer' }}
        </span>
      </button>

      <button class="btn btn-light btn-sm" @click="emit('edit', theme.id)">
        ✏️
      </button>

      <button class="btn btn-sm theme-btn-delete" @click="emit('delete', theme.id)">
        🗑
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Theme } from '../../types'
import { useThemesStore } from '../../stores/themes'

const props = defineProps<{
  theme: Theme
  isGenerating?: boolean
  generateProgress?: number
}>()

const emit = defineEmits<{
  play: [id: string]
  generate: [id: string]
  edit: [id: string]
  delete: [id: string]
}>()

const store = useThemesStore()

const formattedSize = computed(() => {
  const b = props.theme.generatedAudioSize ?? 0
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} Ko`
  return `${(b / (1024 * 1024)).toFixed(1)} Mo`
})

const formattedDate = computed(() => {
  if (!props.theme.generatedAt) return ''
  return new Date(props.theme.generatedAt).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
})
</script>

<style scoped lang="scss">
.theme-card {
  border-left: 4px solid $color-primary !important;
  border-radius: 16px !important;
}

.theme-card__name {
  font-size: 1.1rem;
  color: $color-secondary;
  margin-bottom: 0.5rem;
}

.theme-tag {
  background: #f0fdf4;
  color: #166534;
  font-weight: 400;
  font-size: 0.75rem;
}

.theme-btn-delete {
  background: #fef2f2;
  color: #dc2626;

  &:hover { background: #fee2e2; }
}

.spinner-custom {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: theme-card-spin 0.7s linear infinite;
  vertical-align: middle;
  margin-right: 4px;
}

@keyframes theme-card-spin {
  to { transform: rotate(360deg); }
}
</style>
