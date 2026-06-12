export type BellInterval = 120 | 150 | 180 | 210 | 240 | 270 | 300

export interface BellIntervalOption {
  value: BellInterval
  label: string
}

export const BELL_INTERVAL_OPTIONS: BellIntervalOption[] = [
  { value: 120, label: '2 min' },
  { value: 150, label: '2 min 30' },
  { value: 180, label: '3 min' },
  { value: 210, label: '3 min 30' },
  { value: 240, label: '4 min' },
  { value: 270, label: '4 min 30' },
  { value: 300, label: '5 min' },
]

export interface AudioAsset {
  id: string
  name: string
  path: string
}

export const BELL_ASSETS: AudioAsset[] = [
  { id: 'bell_1', name: 'Bell classique', path: '/assets/audio/bells/bell_1.mp3' },
]

export const MUSIC_ASSETS: AudioAsset[] = [
  // Populated when user provides music files in src/assets/audio/musics/
]

export interface Theme {
  id: string
  name: string
  bellAssetId: string
  bellCustomPath?: string
  bellIntervalSeconds: BellInterval
  sessionDurationMinutes: number
  musicAssetId: string | null
  musicCustomPath?: string
  generatedAudioPath: string | null
  generatedAudioSize: number | null
  generatedAt: number | null
  createdAt: number
  updatedAt: number
}

export type ThemeFormData = Omit<Theme,
  'id' | 'createdAt' | 'updatedAt' | 'generatedAudioPath' | 'generatedAudioSize' | 'generatedAt'
>
