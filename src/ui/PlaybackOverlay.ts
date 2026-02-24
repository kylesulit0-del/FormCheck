import { appStore } from '../core/store'
import { setCameraPreset, type PresetName } from '../core/cameraPresets'
import { getAnimationController } from '../core/animationRef'

const SPEEDS = [0.5, 1, 2] as const

const CAMERA_PRESETS: { label: string; name: PresetName }[] = [
  { label: 'F', name: 'front' },
  { label: 'L', name: 'left'  },
  { label: 'R', name: 'right' },
  { label: 'B', name: 'back'  },
]

/**
 * Shared Tailwind classes for small control buttons.
 */
const btnBase =
  'px-2 py-1 rounded text-xs border ' +
  'hover:bg-white/20 transition-colors cursor-pointer'

const btnInactive = `${btnBase} bg-surface/80 text-white/70 border-white/10`
const btnActive   = `${btnBase} bg-accent/20 text-accent border-accent/30`

/**
 * Update the fill gradient CSS variable on the range input.
 */
function updateSliderFill(slider: HTMLInputElement): void {
  const min = parseFloat(slider.min) || 0
  const max = parseFloat(slider.max) || 1
  const val = parseFloat(slider.value) || 0
  const pct = max > min ? ((val - min) / (max - min)) * 100 : 0
  slider.style.setProperty('--fill-pct', `${pct}%`)
}

/**
 * Mounts playback controls as a single-row control bar in the #control-bar element.
 * Layout (left to right): Play/Pause | Timeline | Speed buttons | Camera presets | Labels
 */
export function mountPlaybackOverlay(_container: HTMLElement): void {
  // Target the structured control bar — not the floating overlay approach
  const bar = document.getElementById('control-bar')!

  // --- Play/Pause button ---
  const playBtn = document.createElement('button')
  playBtn.type = 'button'
  playBtn.className =
    'w-8 h-8 rounded-full bg-surface/80 border border-white/10 text-white ' +
    'flex items-center justify-center hover:bg-white/20 transition-colors ' +
    'text-sm cursor-pointer shrink-0'

  function updatePlayIcon() {
    playBtn.textContent = appStore.getState().isPlaying ? '\u23F8' : '\u25B6'
  }

  playBtn.addEventListener('click', () => {
    const { isPlaying, setPlaying } = appStore.getState()
    setPlaying(!isPlaying)
  })

  updatePlayIcon()
  bar.appendChild(playBtn)

  // --- Timeline slider (flex-1 to fill remaining space) ---
  const slider = document.createElement('input')
  slider.type = 'range'
  slider.id = 'timeline'
  slider.className = 'flex-1'
  slider.min = '0'
  slider.max = '1'
  slider.step = '0.001'
  slider.value = '0'

  slider.addEventListener('pointerdown', () => {
    appStore.getState().setScrubbing(true)
  })

  slider.addEventListener('input', () => {
    const ctrl = getAnimationController()
    if (!ctrl) return
    ctrl.setTime(parseFloat(slider.value))
    updateSliderFill(slider)
  })

  // Release scrubbing even if pointer leaves the slider
  window.addEventListener('pointerup', () => {
    if (appStore.getState().isScrubbing) {
      appStore.getState().setScrubbing(false)
    }
  })

  // Guard against tab-away during drag
  window.addEventListener('blur', () => {
    if (appStore.getState().isScrubbing) {
      appStore.getState().setScrubbing(false)
    }
  })

  updateSliderFill(slider)
  bar.appendChild(slider)

  // --- Speed segmented buttons ---
  const speedGroup = document.createElement('div')
  speedGroup.className = 'flex gap-1 shrink-0'

  const speedBtns: HTMLButtonElement[] = []

  for (const speed of SPEEDS) {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.textContent = `${speed}\u00D7`
    btn.addEventListener('click', () => {
      appStore.getState().setPlaybackSpeed(speed)
    })
    speedBtns.push(btn)
    speedGroup.appendChild(btn)
  }

  function updateSpeedHighlight() {
    const current = appStore.getState().playbackSpeed
    for (let i = 0; i < SPEEDS.length; i++) {
      speedBtns[i].className = SPEEDS[i] === current ? btnActive : btnInactive
    }
  }

  updateSpeedHighlight()
  bar.appendChild(speedGroup)

  // --- Camera preset buttons ---
  const cameraGroup = document.createElement('div')
  cameraGroup.className = 'flex gap-1 shrink-0'

  for (const preset of CAMERA_PRESETS) {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.textContent = preset.label
    btn.className = btnInactive
    btn.title = preset.name.charAt(0).toUpperCase() + preset.name.slice(1)
    btn.addEventListener('click', () => setCameraPreset(preset.name))
    cameraGroup.appendChild(btn)
  }

  bar.appendChild(cameraGroup)

  // --- Annotation toggle ---
  const annotBtn = document.createElement('button')
  annotBtn.type = 'button'
  annotBtn.textContent = 'Labels'
  annotBtn.addEventListener('click', () => {
    const { showAnnotations, setShowAnnotations } = appStore.getState()
    setShowAnnotations(!showAnnotations)
  })

  function updateAnnotBtn() {
    annotBtn.className = appStore.getState().showAnnotations ? btnActive : btnInactive
  }

  updateAnnotBtn()
  bar.appendChild(annotBtn)

  // --- Single store subscription for all button states ---
  appStore.subscribe(() => {
    updatePlayIcon()
    updateSpeedHighlight()
    updateAnnotBtn()
  })

  // --- RAF loop: sync slider with animation time and fill gradient ---
  function syncSlider() {
    const ctrl = getAnimationController()
    if (ctrl && !appStore.getState().isScrubbing) {
      const dur = ctrl.getDuration()
      if (dur > 0) {
        if (slider.max !== String(dur)) slider.max = String(dur)
        slider.value = String(ctrl.getTime())
        updateSliderFill(slider)
      }
    }
    requestAnimationFrame(syncSlider)
  }

  requestAnimationFrame(syncSlider)
}
