<template>
  <div class="music-picker">
    <div class="music-picker__list">
      <button
        type="button"
        class="music-picker__item"
        :class="{ 'music-picker__item--selected': modelValue === null }"
        @click="emit('update:modelValue', null)"
      >
        <span class="music-picker__item-icon">🔇</span>
        <span class="music-picker__item-name">Aucune musique</span>
      </button>

      <button
        v-for="asset in MUSIC_ASSETS"
        :key="asset.id"
        type="button"
        class="music-picker__item"
        :class="{ 'music-picker__item--selected': modelValue === asset.id }"
        @click="select(asset.id)"
      >
        <span class="music-picker__item-icon">🎵</span>
        <span class="music-picker__item-name">{{ asset.name }}</span>
        <button type="button" class="music-picker__preview" title="Écouter" @click.stop="preview(asset)">
          ▶
        </button>
      </button>

      <div v-if="MUSIC_ASSETS.length === 0" class="music-picker__empty">
        Aucune musique prédéfinie pour l'instant
      </div>

      <button
        type="button"
        class="music-picker__item music-picker__item--upload"
        :class="{ 'music-picker__item--selected': modelValue === 'custom' }"
        @click="triggerUpload"
      >
        <span class="music-picker__item-icon">📁</span>
        <span class="music-picker__item-name">{{ customName ?? 'Importer ma musique…' }}</span>
      </button>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept=".mp3,.m4a,.aac,.wav,.ogg"
      style="display: none"
      @change="onFileChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { MUSIC_ASSETS } from '../../types'
import type { AudioAsset } from '../../types'

defineProps<{
  modelValue: string | null
  customName?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
  'update:customPath': [path: string]
  'update:customName': [name: string]
}>()

const fileInput = ref<HTMLInputElement | null>(null)
let previewAudio: HTMLAudioElement | null = null

function select(id: string) {
  emit('update:modelValue', id)
}

function preview(asset: AudioAsset) {
  previewAudio?.pause()
  previewAudio = new Audio(asset.path)
  previewAudio.play()
}

function triggerUpload() {
  fileInput.value?.click()
}

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const url = URL.createObjectURL(file)
  emit('update:modelValue', 'custom')
  emit('update:customPath', url)
  emit('update:customName', file.name)
}
</script>

<style scoped lang="scss">
.music-picker__list {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.music-picker__empty {
  padding: $spacing-sm $spacing-md;
  font-family: 'Nunito', sans-serif;
  font-size: $font-size-sm;
  color: $color-text-muted;
  font-style: italic;
}

.music-picker__item {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-md;
  background: #fff;
  border: 2px solid #e5e7eb;
  border-radius: $radius-md;
  cursor: pointer;
  text-align: left;
  width: 100%;
  font-family: 'Nunito', sans-serif;
  font-size: $font-size-base;
  color: $color-text;
  transition: border-color 0.15s ease;

  &--selected {
    border-color: $color-primary;
    background: #f0fdf4;
  }

  &--upload {
    border-style: dashed;
    color: $color-text-muted;
  }

  &:hover:not(.music-picker__item--selected) {
    border-color: #d1d5db;
  }
}

.music-picker__item-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.music-picker__item-name {
  flex: 1;
  font-weight: 600;
}

.music-picker__preview {
  background: none;
  border: none;
  font-size: 0.75rem;
  color: $color-primary;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: $radius-sm;

  &:hover {
    background: #dcfce7;
  }
}
</style>
