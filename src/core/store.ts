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
  /** Whether the user is dragging the timeline scrub slider */
  isScrubbing: boolean
  /** Whether annotation overlay labels are visible */
  showAnnotations: boolean
  /** Whether the left panel is collapsed */
  leftPanelCollapsed: boolean
  /** Whether the right panel is collapsed */
  rightPanelCollapsed: boolean

  // Actions
  setExercise: (id: string) => void
  setPlaying: (playing: boolean) => void
  setPlaybackSpeed: (speed: number) => void
  setScrubbing: (v: boolean) => void
  setShowAnnotations: (v: boolean) => void
  setLeftPanelCollapsed: (v: boolean) => void
  setRightPanelCollapsed: (v: boolean) => void
}

/**
 * Zustand vanilla store (v5 API — createStore from zustand/vanilla).
 * No React dependency — used directly in render loop and UI handlers.
 */
export const appStore = createStore<AppState>((set) => ({
  selectedExerciseId: 'squat',
  isPlaying: true,
  playbackSpeed: 1.0,
  isScrubbing: false,
  showAnnotations: true,
  leftPanelCollapsed: false,
  rightPanelCollapsed: false,

  setExercise: (id: string) => set({ selectedExerciseId: id }),
  setPlaying: (playing: boolean) => set({ isPlaying: playing }),
  setPlaybackSpeed: (speed: number) => set({ playbackSpeed: speed }),
  setScrubbing: (v: boolean) => set({ isScrubbing: v }),
  setShowAnnotations: (v: boolean) => set({ showAnnotations: v }),
  setLeftPanelCollapsed: (v: boolean) => set({ leftPanelCollapsed: v }),
  setRightPanelCollapsed: (v: boolean) => set({ rightPanelCollapsed: v }),
}))
