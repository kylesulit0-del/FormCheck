import { createStore } from 'zustand/vanilla'

/**
 * Application state interface.
 */
export interface AppState {
  /** Currently selected exercise ID */
  selectedExerciseId: string
  /** Whether the animation is playing */
  isPlaying: boolean
  /** Playback speed multiplier */
  playbackSpeed: number

  // Actions
  setExercise: (id: string) => void
  setPlaying: (playing: boolean) => void
  setPlaybackSpeed: (speed: number) => void
}

/**
 * Zustand vanilla store (v5 API — createStore from zustand/vanilla).
 * No React dependency — used directly in render loop and UI handlers.
 */
export const appStore = createStore<AppState>((set) => ({
  selectedExerciseId: 'squat',
  isPlaying: true,
  playbackSpeed: 1.0,

  setExercise: (id: string) => set({ selectedExerciseId: id }),
  setPlaying: (playing: boolean) => set({ isPlaying: playing }),
  setPlaybackSpeed: (speed: number) => set({ playbackSpeed: speed }),
}))
