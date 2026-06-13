<template>
  <div class="min-vh-100 d-flex flex-column" style="background: #fafafa">
    <AppHeader :title="isEditing ? 'Modifier le thème' : 'Nouveau thème'" :show-back="true" />

    <main class="flex-grow-1 p-4 w-100 mx-auto" style="max-width: 600px">
      <form class="d-flex flex-column gap-4" @submit.prevent="save">

        <!-- Name -->
        <div>
          <label class="form-label fw-bold text-secondary" for="theme-name">Nom de la piste *</label>
          <input
            id="theme-name"
            v-model="form.name"
            type="text"
            class="form-control"
            placeholder="Ex. Séance bien-être 45 min"
            required
            maxlength="60"
          />
        </div>

        <!-- Bell picker -->
        <div>
          <label class="form-label fw-bold text-secondary">Cloche *</label>
          <BellPicker
            v-model="form.bellAssetId"
            :custom-name="bellCustomName"
            @update:custom-path="form.bellCustomPath = $event"
            @update:custom-name="bellCustomName = $event"
          />
        </div>

        <!-- Interval -->
        <div>
          <label class="form-label fw-bold text-secondary" for="theme-interval">Intervalle entre les sonnes *</label>
          <select id="theme-interval" v-model.number="form.bellIntervalSeconds" class="form-select">
            <option v-for="opt in BELL_INTERVAL_OPTIONS" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>

        <!-- Duration -->
        <div>
          <label class="form-label fw-bold text-secondary" for="theme-duration">
            Durée de la séance *
            <span class="text-muted fw-normal small">(1 – 90 min)</span>
          </label>
          <div class="d-flex align-items-center gap-2">
            <input
              id="theme-duration"
              v-model.number="form.sessionDurationMinutes"
              type="number"
              class="form-control"
              style="max-width: 120px"
              min="1"
              max="90"
              required
            />
            <span class="text-muted">min</span>
          </div>
          <p class="small text-muted mt-2 mb-0 px-2 py-1 rounded-1" style="background: #f0fdf4">
            {{ bellCount }} sonnerie{{ bellCount > 1 ? 's' : '' }} · fichier audio estimé ≈ {{ estimatedSizeMb }} Mo
          </p>
        </div>

        <!-- Music picker -->
        <div>
          <label class="form-label fw-bold text-secondary">
            Musique de fond <span class="text-muted fw-normal small">(optionnel)</span>
          </label>
          <MusicPicker
            v-model="form.musicAssetId"
            :custom-name="musicCustomName"
            @update:custom-path="form.musicCustomPath = $event"
            @update:custom-name="musicCustomName = $event"
          />
        </div>

        <button type="submit" class="btn btn-primary rounded-pill fw-bold py-3 w-100 fs-5 mt-2">
          {{ isEditing ? '💾 Enregistrer les modifications' : '✅ Créer le thème' }}
        </button>
      </form>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useThemesStore } from '../../stores/themes'
import { BELL_ASSETS, BELL_INTERVAL_OPTIONS } from '../../types'
import type { BellInterval, ThemeFormData } from '../../types'
import AppHeader from '../../components/ui/AppHeader.vue'
import BellPicker from '../../components/music/BellPicker.vue'
import MusicPicker from '../../components/music/MusicPicker.vue'

const route = useRoute()
const router = useRouter()
const themesStore = useThemesStore()

const isEditing = computed(() => !!route.params.id)

const form = ref<ThemeFormData>({
  name: '',
  bellAssetId: BELL_ASSETS[0].id,
  bellCustomPath: undefined,
  bellIntervalSeconds: 300 as BellInterval,
  sessionDurationMinutes: 45,
  musicAssetId: null,
  musicCustomPath: undefined,
})

const bellCustomName = ref<string | undefined>(undefined)
const musicCustomName = ref<string | undefined>(undefined)

const bellCount = computed(() => {
  const d = form.value.sessionDurationMinutes * 60
  const i = form.value.bellIntervalSeconds
  return Math.floor(d / i) + 1
})

// 64 kbps mono MP3: 64000 bits/s = 8000 bytes/s
const estimatedSizeMb = computed(() => {
  const bytes = form.value.sessionDurationMinutes * 60 * 8000
  return (bytes / (1024 * 1024)).toFixed(1)
})

onMounted(() => {
  if (!isEditing.value) return
  const theme = themesStore.getTheme(route.params.id as string)
  if (!theme) { router.replace({ name: 'music' }); return }
  form.value = {
    name: theme.name,
    bellAssetId: theme.bellAssetId,
    bellCustomPath: theme.bellCustomPath,
    bellIntervalSeconds: theme.bellIntervalSeconds,
    sessionDurationMinutes: theme.sessionDurationMinutes,
    musicAssetId: theme.musicAssetId,
    musicCustomPath: theme.musicCustomPath,
  }
})

function save() {
  if (isEditing.value) {
    themesStore.updateTheme(route.params.id as string, form.value)
    // Invalidate generated audio since config changed
    themesStore.clearGeneratedAudio(route.params.id as string)
  } else {
    themesStore.createTheme(form.value)
  }
  router.push({ name: 'music' })
}
</script>
