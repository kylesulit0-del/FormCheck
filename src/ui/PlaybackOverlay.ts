import { appStore } from '../core/store'
import { setCameraPreset, type PresetName } from '../core/cameraPresets'
import { getAnimationController } from '../core/animationRef'

const SPEEDS = [0.5, 1, 2] as const
const CAMERA_PRESETS: { label: string; name: PresetName }[] = [
  { label: 'Front', name: 'front' },
  { label: 'Side', name: 'side' },
  { label: 'Back', name: 'back' },
]

/**
 * Shared Tailwind classes for small control buttons.
 */
const btnBase =
  'px-2 py-1 rounded text-xs border border-white/10 ' +
  'hover:bg-white/20 transition-colors cursor-pointer'

const btnInactive = `${btnBase} bg-surface/80 text-white/70`
const btnActive = `${btnBase} bg-accent/20 text-accent`

/**
 * Mounts playback controls overlay at the bottom-center of the 3D viewer.
 * Contains: camera presets, play/pause, speed buttons, timeline slider.
 */
export function mountPlaybackOverlay(container: HTMLElement): void {
  const wrapper = document.createElement('div')
  wrapper.className =
    'absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2'

  // --- Camera presets row ---
  const cameraRow = document.createElement('div')
  cameraRow.className = 'flex gap-1'

  for (const preset of CAMERA_PRESETS) {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.textContent = preset.label
    btn.className = btnInactive
    btn.addEventListener('click', () => setCameraPreset(preset.name))
    cameraRow.appendChild(btn)
  }

  // Annotation toggle button
  const annotBtn = document.createElement('button')
  annotBtn.type = 'button'
  annotBtn.textContent = 'Labels'
  annotBtn.addEventListener('click', () => {
    const { showAnnotations, setShowAnnotations } = appStore.getState()
    setShowAnnotations(!showAnnotations)
  })
  cameraRow.appendChild(annotBtn)

  // --- Playback row (play/pause + speed buttons) ---
  const playbackRow = document.createElement('div')
  playbackRow.className = 'flex items-center gap-2'

  // Play/pause button
  const playBtn = document.createElement('button')
  playBtn.type = 'button'
  playBtn.className =
    'w-10 h-10 rounded-full bg-surface/80 backdrop-blur-sm ' +
    'border border-white/10 text-white flex items-center justify-center ' +
    'hover:bg-white/20 transition-colors text-lg cursor-pointer'

  function updatePlayIcon() {
    playBtn.textContent = appStore.getState().isPlaying ? '\u23F8' : '\u25B6'
  }

  playBtn.addEventListener('click', () => {
    const { isPlaying, setPlaying } = appStore.getState()
    setPlaying(!isPlaying)
  })

  updatePlayIcon()
  playbackRow.appendChild(playBtn)

  // Speed buttons
  const speedBtns: HTMLButtonElement[] = []

  for (const speed of SPEEDS) {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.textContent = `${speed}×`
    btn.addEventListener('click', () => {
      appStore.getState().setPlaybackSpeed(speed)
    })
    speedBtns.push(btn)
    playbackRow.appendChild(btn)
  }

  function updateSpeedHighlight() {
    const current = appStore.getState().playbackSpeed
    for (let i = 0; i < SPEEDS.length; i++) {
      speedBtns[i].className = SPEEDS[i] === current ? btnActive : btnInactive
    }
  }

  updateSpeedHighlight()

  function updateAnnotBtn() {
    annotBtn.className = appStore.getState().showAnnotations ? btnActive : btnInactive
  }
  updateAnnotBtn()

  // Subscribe to store changes
  appStore.subscribe(() => {
    updatePlayIcon()
    updateSpeedHighlight()
    updateAnnotBtn()
  })

  // --- Timeline scrub slider ---
  const sliderRow = document.createElement('div')
  sliderRow.className = 'w-48'

  const slider = document.createElement('input')
  slider.type = 'range'
  slider.min = '0'
  slider.max = '1'
  slider.step = '0.01'
  slider.value = '0'
  slider.className = 'w-full accent-accent h-1 cursor-pointer'
  slider.style.cssText = 'appearance: auto; opacity: 0.85;'

  slider.addEventListener('input', () => {
    const ctrl = getAnimationController()
    if (!ctrl) return
    appStore.getState().setScrubbing(true)
    ctrl.setTime(parseFloat(slider.value))
  })

  slider.addEventListener('change', () => {
    appStore.getState().setScrubbing(false)
  })

  sliderRow.appendChild(slider)

  // RAF loop to sync slider with animation time
  let rafId = 0
  function syncSlider() {
    const ctrl = getAnimationController()
    if (ctrl && !appStore.getState().isScrubbing) {
      const dur = ctrl.getDuration()
      if (dur > 0) {
        // Update max if clip changed
        if (slider.max !== String(dur)) slider.max = String(dur)
        slider.value = String(ctrl.getTime())
      }
    }
    rafId = requestAnimationFrame(syncSlider)
  }
  rafId = requestAnimationFrame(syncSlider)

  // Clean up on removal (defensive)
  wrapper.addEventListener('DOMNodeRemovedFromDocument', () => {
    cancelAnimationFrame(rafId)
  })

  wrapper.appendChild(cameraRow)
  wrapper.appendChild(playbackRow)
  wrapper.appendChild(sliderRow)
  container.appendChild(wrapper)
}
