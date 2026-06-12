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
        v-if="theme.generatedAudioPath"
        class="theme-card__btn theme-card__btn--play"
        :disabled="isGenerating"
        @click="emit('play', theme.id)"
      >
        ▶ Jouer
      </button>

      <button
        class="theme-card__btn theme-card__btn--generate"
        :disabled="isGenerating"
        @click="emit('generate', theme.id)"
      >
        <span v-if="isGenerating">
          <span class="theme-card__spinner" /> {{ generateProgress }}%
        </span>
        <span v-else>
          {{ theme.generatedAudioPath ? '↺' : '⚡ Générer' }}
        </span>
      </button>

      <button class="theme-card__btn theme-card__btn--edit" @click="emit('edit', theme.id)">
        ✏️
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

<style src="../../scss/components/music/theme-card.scss" scoped lang="scss" />
