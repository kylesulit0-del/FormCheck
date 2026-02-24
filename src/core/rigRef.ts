import type { Object3D } from 'three'

let _joints: Map<string, Object3D> | null = null

export function setRigJoints(joints: Map<string, Object3D> | null): void {
  _joints = joints
}

export function getRigJoints(): Map<string, Object3D> | null {
  return _joints
}
