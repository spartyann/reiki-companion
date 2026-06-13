<template>
  <div
    class="d-inline-flex align-items-center gap-1 px-2 py-1 rounded-pill storage-indicator"
    :class="isHigh ? 'storage-indicator--warn' : 'storage-indicator--ok'"
  >
    <span style="font-size: 0.875rem">💾</span>
    <span style="font-size: 0.75rem">Stockage : <strong>{{ formattedSize }}</strong></span>
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

<style scoped>
.storage-indicator--ok {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
}
.storage-indicator--warn {
  background: #fefce8;
  border: 1px solid #fde68a;
  color: #92400e;
}
</style>
