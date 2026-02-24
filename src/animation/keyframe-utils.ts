import * as THREE from 'three'

/**
 * Convert degrees to radians.
 */
export function deg(d: number): number {
  return d * (Math.PI / 180)
}

/**
 * A single keyframe expressed as Euler angles in degrees (ZYX order).
 * x, y, z are rotation around each axis in degrees.
 */
export interface EulerKeyframe {
  time: number
  x: number
  y: number
  z: number
}

/**
 * Build a QuaternionKeyframeTrack from Euler-angle keyframes.
 *
 * @param bonePath - Object3D name followed by ".quaternion"
 *                   e.g. 'l_knee.quaternion'
 * @param keyframes - Array of {time, x, y, z} in degrees (ZYX Euler order)
 * @returns THREE.QuaternionKeyframeTrack
 *
 * NOTE: bonePath must match the Object3D.name value exactly (JointName enum string).
 * The Euler order is ZYX — the biomechanical convention used throughout FormCheck.
 */
export function buildQuatTrack(
  bonePath: string,
  keyframes: EulerKeyframe[],
): THREE.QuaternionKeyframeTrack {
  const times: number[] = []
  const values: number[] = []

  for (const kf of keyframes) {
    const euler = new THREE.Euler(deg(kf.x), deg(kf.y), deg(kf.z), 'ZYX')
    const quat = new THREE.Quaternion().setFromEuler(euler)

    times.push(kf.time)
    values.push(quat.x, quat.y, quat.z, quat.w)
  }

  return new THREE.QuaternionKeyframeTrack(bonePath, times, values)
}

/**
 * Build a THREE.AnimationClip from an array of KeyframeTracks.
 *
 * @param name     - Clip name (e.g. 'squat')
 * @param tracks   - Array of KeyframeTracks (use buildQuatTrack per joint)
 * @param duration - Clip duration in seconds (-1 for auto-compute from tracks)
 */
export function buildClip(
  name: string,
  tracks: THREE.KeyframeTrack[],
  duration = -1,
): THREE.AnimationClip {
  return new THREE.AnimationClip(name, duration, tracks)
}
