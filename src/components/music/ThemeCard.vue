<template>
  <div class="theme-card">
    <div class="theme-card__header">
      <div class="theme-card__info">
        <h3 class="theme-card__name">{{ theme.name }}</h3>
        <div class="theme-card__meta">
          <span class="theme-card__tag">🔔 {{ store.getBellLabel(theme) }}</span>
          <span class="theme-card__tag">⏱ {{ store.getIntervalLabel(theme) }}</span>
          <span class="theme-card__tag">🕐 {{ theme.sessionDurationMinutes }} min</span>
          <span v-if="theme.musicAssetId" class="theme-card__tag">🎵 Musique</span>
        </div>
      </div>
    </div>

    <div class="theme-card__audio">
      <div v-if="theme.generatedAudioPath" class="theme-card__audio-ok">
        <span class="theme-card__audio-icon">✅</span>
        <div class="theme-card__audio-details">
          <span>Audio généré</span>
          <span class="theme-card__audio-size">{{ formattedSize }} · {{ formattedDate }}</span>
        </div>
      </div>
      <div v-else class="theme-card__audio-missing">
        <span class="theme-card__audio-icon">⚠️</span>
        <span>Audio non généré</span>
      </div>
    </div>

    <div class="theme-card__actions">
      <button
        class="theme-card__btn theme-card__btn--generate"
        :disabled="isGenerating"
        @click="emit('generate', theme.id)"
      >
        <span v-if="isGenerating">
          <span class="theme-card__spinner" /> {{ generateProgress }}%
        </span>
        <span v-else>
          {{ theme.generatedAudioPath ? '↺ Regénérer' : '⚡ Générer l\'audio' }}
        </span>
      </button>

      <button class="theme-card__btn theme-card__btn--edit" @click="emit('edit', theme.id)">
        ✏️ Modifier
      </button>

      <button class="theme-card__btn theme-card__btn--delete" @click="emit('delete', theme.id)">
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
  background: #fff;
  border-radius: $radius-lg;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
  overflow: hidden;
  border-left: 4px solid $color-primary;
}

.theme-card__header {
  padding: $spacing-md;
  border-bottom: 1px solid #f3f4f6;
}

.theme-card__name {
  font-family: 'Bona Nova', serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: $color-secondary;
  margin: 0 0 $spacing-xs;
}

.theme-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-xs;
}

.theme-card__tag {
  font-family: 'Nunito', sans-serif;
  font-size: $font-size-sm;
  background: #f0fdf4;
  color: #166534;
  padding: 2px 8px;
  border-radius: $radius-full;
}

.theme-card__audio {
  padding: $spacing-sm $spacing-md;
  background: #fafafa;
  border-bottom: 1px solid #f3f4f6;
}

.theme-card__audio-ok,
.theme-card__audio-missing {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  font-family: 'Nunito', sans-serif;
  font-size: $font-size-sm;
}

.theme-card__audio-icon {
  font-size: 1rem;
  flex-shrink: 0;
}

.theme-card__audio-details {
  display: flex;
  flex-direction: column;
  gap: 1px;
  font-weight: 600;
  color: #166534;
}

.theme-card__audio-size {
  font-size: 0.75rem;
  font-weight: 400;
  color: $color-text-muted;
}

.theme-card__audio-missing {
  color: #92400e;
}

.theme-card__actions {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-md;
}

.theme-card__btn {
  font-family: 'Nunito', sans-serif;
  font-size: $font-size-sm;
  font-weight: 700;
  border: none;
  border-radius: $radius-md;
  cursor: pointer;
  padding: 7px 14px;
  transition: opacity 0.15s ease;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &--generate {
    flex: 1;
    background: $color-primary;
    color: #fff;

    &:hover:not(:disabled) {
      background: $color-primary-dark;
    }
  }

  &--edit {
    background: #f3f4f6;
    color: $color-text;

    &:hover {
      background: #e5e7eb;
    }
  }

  &--delete {
    background: #fef2f2;
    color: #dc2626;
    padding: 7px 10px;

    &:hover {
      background: #fee2e2;
    }
  }
}

.theme-card__spinner {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  vertical-align: middle;
  margin-right: 4px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
