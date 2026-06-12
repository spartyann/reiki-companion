<template>
  <div class="music-picker">
    <div class="music-picker__list">
      <div
        class="music-picker__item"
        :class="{ 'music-picker__item--selected': modelValue === null }"
        role="radio"
        :aria-checked="modelValue === null"
        tabindex="0"
        @click="emit('update:modelValue', null)"
        @keydown.enter.space.prevent="emit('update:modelValue', null)"
      >
        <span class="music-picker__item-icon">🔇</span>
        <span class="music-picker__item-name">Aucune musique</span>
      </div>

      <div
        v-for="asset in MUSIC_ASSETS"
        :key="asset.id"
        class="music-picker__item"
        :class="{ 'music-picker__item--selected': modelValue === asset.id }"
        role="radio"
        :aria-checked="modelValue === asset.id"
        tabindex="0"
        @click="select(asset.id)"
        @keydown.enter.space.prevent="select(asset.id)"
      >
        <span class="music-picker__item-icon">🎵</span>
        <span class="music-picker__item-name">{{ asset.name }}</span>
        <button type="button" class="music-picker__preview" title="Écouter" @click.stop="preview(asset)">
          ▶
        </button>
      </div>

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

<style src="../../scss/components/music/music-picker.scss" scoped lang="scss" />
