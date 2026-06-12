<template>
  <div class="bell-picker">
    <div class="bell-picker__list">
      <button
        v-for="asset in BELL_ASSETS"
        :key="asset.id"
        type="button"
        class="bell-picker__item"
        :class="{ 'bell-picker__item--selected': modelValue === asset.id }"
        @click="select(asset.id)"
      >
        <span class="bell-picker__item-icon">🔔</span>
        <span class="bell-picker__item-name">{{ asset.name }}</span>
        <button type="button" class="bell-picker__preview" title="Écouter" @click.stop="preview(asset)">
          ▶
        </button>
      </button>

      <button
        type="button"
        class="bell-picker__item"
        :class="{ 'bell-picker__item--selected': modelValue === 'custom' }"
        @click="triggerUpload"
      >
        <span class="bell-picker__item-icon">📁</span>
        <span class="bell-picker__item-name">{{ customName ?? 'Importer un fichier…' }}</span>
      </button>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept=".mp3,.m4a,.aac,.wav"
      style="display: none"
      @change="onFileChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { BELL_ASSETS } from '../../types'
import type { AudioAsset } from '../../types'

const props = defineProps<{
  modelValue: string
  customName?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
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
.bell-picker__list {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.bell-picker__item {
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

  &:hover:not(.bell-picker__item--selected) {
    border-color: #d1d5db;
  }
}

.bell-picker__item-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.bell-picker__item-name {
  flex: 1;
  font-weight: 600;
}

.bell-picker__preview {
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
