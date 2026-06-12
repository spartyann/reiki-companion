<template>
  <div class="storage-indicator" :class="{ 'storage-indicator--warning': isHigh }">
    <span class="storage-indicator__icon">💾</span>
    <span class="storage-indicator__text">
      Stockage audio : <strong>{{ formattedSize }}</strong>
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ bytes: number }>()

const formattedSize = computed(() => {
  const b = props.bytes
  if (b === 0) return '0 octet'
  if (b < 1024) return `${b} o`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} Ko`
  return `${(b / (1024 * 1024)).toFixed(1)} Mo`
})

// Warn above 200 MB
const isHigh = computed(() => props.bytes > 200 * 1024 * 1024)
</script>

<style scoped lang="scss">
.storage-indicator {
  display: inline-flex;
  align-items: center;
  gap: $spacing-xs;
  padding: 6px $spacing-sm;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: $radius-full;
  font-family: 'Nunito', sans-serif;
  font-size: $font-size-sm;
  color: #166534;

  &--warning {
    background: #fefce8;
    border-color: #fde68a;
    color: #92400e;
  }
}

.storage-indicator__icon {
  font-size: 0.875rem;
}
</style>
