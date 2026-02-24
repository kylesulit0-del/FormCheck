import type { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import type { PerspectiveCamera } from 'three'

let _controls: OrbitControls | null = null
let _camera: PerspectiveCamera | null = null

const presets = {
  front: { x: 0, y: 1, z: 3 },
  side:  { x: 3, y: 1, z: 0 },
  back:  { x: 0, y: 1, z: -3 },
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
}

/**
 * Snap the camera to a named preset position, looking at the mannequin center.
 */
export function setCameraPreset(name: PresetName): void {
  if (!_controls || !_camera) return
  const p = presets[name]
  _camera.position.set(p.x, p.y, p.z)
  _controls.target.set(0, 0.9, 0)
  _controls.update()
}
