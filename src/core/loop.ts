import * as THREE from 'three'

/**
 * Render loop controls returned by createRenderLoop.
 */
export interface RenderLoopControls {
  start: () => void
  stop: () => void
}

/**
 * Creates an animation render loop using THREE.Clock for frame timing.
 *
 * @param renderer - The WebGLRenderer to call render on each frame
 * @param scene - The Scene to render
 * @param camera - The camera to render from
 * @param onTick - Optional callback called each frame with delta time in seconds
 * @returns start/stop controls
 */
export function createRenderLoop(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  onTick?: (delta: number, elapsed: number) => void,
): RenderLoopControls {
  const clock = new THREE.Clock()
  let rafId: number | null = null
  let running = false

  function tick(): void {
    if (!running) return
    rafId = requestAnimationFrame(tick)

    const delta = clock.getDelta()
    const elapsed = clock.getElapsedTime()

    if (onTick) {
      onTick(delta, elapsed)
    }

    renderer.render(scene, camera)
  }

  return {
    start(): void {
      if (running) return
      running = true
      clock.start()
      tick()
    },
    stop(): void {
      running = false
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
        rafId = null
      }
      clock.stop()
    },
  }
}
