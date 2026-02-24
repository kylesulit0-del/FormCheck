import { appStore } from '../core/store'

/**
 * Mounts a play/pause button overlay at the bottom-center of the 3D viewer.
 */
export function mountPlaybackOverlay(container: HTMLElement): void {
  const wrapper = document.createElement('div')
  wrapper.className = 'absolute bottom-4 left-1/2 -translate-x-1/2 z-10'

  const btn = document.createElement('button')
  btn.type = 'button'
  btn.className =
    'w-10 h-10 rounded-full bg-surface/80 backdrop-blur-sm ' +
    'border border-white/10 text-white flex items-center justify-center ' +
    'hover:bg-white/20 transition-colors text-lg cursor-pointer'

  function updateIcon() {
    btn.textContent = appStore.getState().isPlaying ? '\u23F8' : '\u25B6'
  }

  btn.addEventListener('click', () => {
    const { isPlaying, setPlaying } = appStore.getState()
    setPlaying(!isPlaying)
  })

  updateIcon()
  appStore.subscribe(updateIcon)

  wrapper.appendChild(btn)
  container.appendChild(wrapper)
}
