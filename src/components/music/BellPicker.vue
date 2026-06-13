<template>
  <div class="d-flex flex-column gap-2">
    <div
      v-for="asset in BELL_ASSETS"
      :key="asset.id"
      class="picker-item d-flex align-items-center gap-2 px-3 py-2 w-100"
      :class="{ 'picker-item--selected': modelValue === asset.id }"
      role="radio"
      :aria-checked="modelValue === asset.id"
      tabindex="0"
      @click="select(asset.id)"
      @keydown.enter.space.prevent="select(asset.id)"
    >
      <span class="picker-item__icon">🔔</span>
      <span class="flex-grow-1 fw-semibold">{{ asset.name }}</span>
      <button type="button" class="btn btn-link btn-sm p-1 picker-preview" title="Écouter" @click.stop="preview(asset)">
        ▶
      </button>
    </div>

    <div
      class="picker-item d-flex align-items-center gap-2 px-3 py-2 w-100"
      :class="{ 'picker-item--selected': modelValue === 'custom' }"
      role="radio"
      :aria-checked="modelValue === 'custom'"
      tabindex="0"
      @click="triggerUpload"
      @keydown.enter.space.prevent="triggerUpload"
    >
      <span class="picker-item__icon">📁</span>
      <span class="flex-grow-1 fw-semibold text-muted">{{ customName ?? 'Importer un fichier…' }}</span>
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
.picker-item {
  background: #fff;
  border: 2px solid #e5e7eb;
  border-radius: $radius-md;
  cursor: pointer;
  transition: border-color 0.15s ease;

  &--selected {
    border-color: $color-primary;
    background: #f0fdf4;
  }

  &:hover:not(.picker-item--selected) {
    border-color: #d1d5db;
  }
}

.picker-item__icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.picker-preview {
  color: $color-primary;
  text-decoration: none;

  &:hover {
    background: #dcfce7;
    border-radius: $radius-sm;
  }
}
</style>
