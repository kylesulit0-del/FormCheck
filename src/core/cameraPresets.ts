import * as THREE from 'three'
import type { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import type { PerspectiveCamera } from 'three'

let _controls: OrbitControls | null = null
let _camera: PerspectiveCamera | null = null
let _targetPosition: THREE.Vector3 | null = null

const presets = {
  front: { x: 0,  y: 1, z: 3  },
  left:  { x: -3, y: 1, z: 0  },
  right: { x: 3,  y: 1, z: 0  },
  back:  { x: 0,  y: 1, z: -3 },
} as const

export type PresetName = keyof typeof presets

/**
 * Register OrbitControls + camera so preset buttons can move the camera
 * without circular imports back to main.ts.
 */
export function registerControls(
  controls: OrbitControls,
  camera: PerspectiveCamera,
): void {
  _controls = controls
  _camera = camera

  // Cancel any active lerp if the user manually drags
  controls.addEventListener('start', () => {
    _targetPosition = null
  })
}

/**
 * Begin a smooth camera lerp to a named preset position.
 * Sets the look-at target immediately; position is animated each tick.
 */
export function setCameraPreset(name: PresetName): void {
  if (!_controls || !_camera) return
  const p = presets[name]
  _targetPosition = new THREE.Vector3(p.x, p.y, p.z)
  _controls.target.set(0, 0.9, 0)
}

/**
 * Called each render tick to advance the camera lerp animation.
 * Returns early if no animation is active or camera is not registered.
 * Does NOT call _controls.update() — main.ts handles that.
 */
export function tickCameraAnimation(): void {
  if (!_targetPosition || !_camera || !_controls) return

  _camera.position.lerp(_targetPosition, 0.18)

  if (_camera.position.distanceTo(_targetPosition) < 0.005) {
    _camera.position.copy(_targetPosition)
    _targetPosition = null
  }
}
