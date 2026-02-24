import * as THREE from 'three'
import { JointName } from './mannequin.types'
import { createTorsoSegments } from './segments/torso'
import { createArms, createLegs } from './segments/limbs'
import { createHeadSegments } from './segments/head'

/**
 * MannequinRig — the full programmatic mannequin.
 *
 * root: the top-level Object3D (pelvis joint); add this to the scene.
 * joints: map from JointName string -> Object3D (the pivot point for that joint).
 *         Animation tracks reference joints by name — these must match JointName enum values exactly.
 * segmentMaterials: map from SegmentName string -> MeshStandardMaterial.
 *                   Phase 4 uses this to highlight individual muscle groups.
 */
export interface MannequinRig {
  root: THREE.Object3D
  joints: Map<string, THREE.Object3D>
  segmentMaterials: Map<string, THREE.MeshStandardMaterial>
}

/**
 * Builds the full mannequin joint hierarchy and attaches segment meshes.
 *
 * Joint hierarchy (parent -> child):
 *   pelvis
 *   ├── spine
 *   │   └── chest
 *   │       ├── neck
 *   │       │   └── head
 *   │       ├── l_shoulder
 *   │       │   └── l_elbow
 *   │       │       └── l_wrist
 *   │       └── r_shoulder
 *   │           └── r_elbow
 *   │               └── r_wrist
 *   ├── l_hip
 *   │   └── l_knee
 *   │       └── l_ankle
 *   └── r_hip
 *       └── r_knee
 *           └── r_ankle
 *
 * The mannequin is centered with feet near y=0 and total height ~1.75m.
 */
export function buildMannequin(): MannequinRig {
  const joints = new Map<string, THREE.Object3D>()
  const segmentMaterials = new Map<string, THREE.MeshStandardMaterial>()

  // Helper: create a named joint pivot Object3D
  function joint(name: JointName): THREE.Object3D {
    const obj = new THREE.Object3D()
    obj.name = name
    joints.set(name, obj)
    return obj
  }

  // Build joint hierarchy -------------------------------------------------

  // Pelvis — root joint, positioned so feet will be near y=0.
  // Full height: feet(0) -> ankle(0.06) -> knee(0.46) -> hip(0.92) -> pelvis(0.97)
  // Pelvis sits at y=0.97
  const pelvis = joint(JointName.pelvis)
  pelvis.position.set(0, 0.97, 0)

  // Spine — base of lumbar, just above pelvis
  const spine = joint(JointName.spine)
  spine.position.set(0, 0.12, 0)
  pelvis.add(spine)

  // Chest — upper thoracic, ~sternum level
  const chest = joint(JointName.chest)
  chest.position.set(0, 0.28, 0)
  spine.add(chest)

  // Neck — sits on top of chest/shoulders
  const neck = joint(JointName.neck)
  neck.position.set(0, 0.24, 0)
  chest.add(neck)

  // Head — pivots from neck top
  const head = joint(JointName.head)
  head.position.set(0, 0.12, 0)
  neck.add(head)

  // Left arm chain (left = +X side from mannequin's perspective)
  const lShoulder = joint(JointName.l_shoulder)
  lShoulder.position.set(0.22, 0.2, 0)
  chest.add(lShoulder)

  const lElbow = joint(JointName.l_elbow)
  lElbow.position.set(0, -0.28, 0)
  lShoulder.add(lElbow)

  const lWrist = joint(JointName.l_wrist)
  lWrist.position.set(0, -0.26, 0)
  lElbow.add(lWrist)

  // Right arm chain (right = -X side)
  const rShoulder = joint(JointName.r_shoulder)
  rShoulder.position.set(-0.22, 0.2, 0)
  chest.add(rShoulder)

  const rElbow = joint(JointName.r_elbow)
  rElbow.position.set(0, -0.28, 0)
  rShoulder.add(rElbow)

  const rWrist = joint(JointName.r_wrist)
  rWrist.position.set(0, -0.26, 0)
  rElbow.add(rWrist)

  // Left leg chain (left = +X)
  const lHip = joint(JointName.l_hip)
  lHip.position.set(0.1, -0.06, 0)
  pelvis.add(lHip)

  const lKnee = joint(JointName.l_knee)
  lKnee.position.set(0, -0.42, 0)
  lHip.add(lKnee)

  const lAnkle = joint(JointName.l_ankle)
  lAnkle.position.set(0, -0.40, 0)
  lKnee.add(lAnkle)

  // Right leg chain (right = -X)
  const rHip = joint(JointName.r_hip)
  rHip.position.set(-0.1, -0.06, 0)
  pelvis.add(rHip)

  const rKnee = joint(JointName.r_knee)
  rKnee.position.set(0, -0.42, 0)
  rHip.add(rKnee)

  const rAnkle = joint(JointName.r_ankle)
  rAnkle.position.set(0, -0.40, 0)
  rKnee.add(rAnkle)

  // Attach segment meshes to joints ----------------------------------------

  // Torso segments attach to pelvis (their local positions are relative to pelvis)
  const torso = createTorsoSegments()
  pelvis.add(torso.meshes)
  torso.materials.forEach((mat, name) => segmentMaterials.set(name, mat))

  // Head / neck segments
  const headSegs = createHeadSegments()
  neck.add(headSegs.neckGroup)
  head.add(headSegs.headGroup)
  headSegs.materials.forEach((mat, name) => segmentMaterials.set(name, mat))

  // Arm segments
  const arms = createArms()
  lShoulder.add(arms.lUpperArm)
  lElbow.add(arms.lForearm)
  rShoulder.add(arms.rUpperArm)
  rElbow.add(arms.rForearm)
  arms.materials.forEach((mat, name) => segmentMaterials.set(name, mat))

  // Leg segments
  const legs = createLegs()
  lHip.add(legs.lThigh)
  lKnee.add(legs.lShin)
  rHip.add(legs.rThigh)
  rKnee.add(legs.rShin)
  legs.materials.forEach((mat, name) => segmentMaterials.set(name, mat))

  return { root: pelvis, joints, segmentMaterials }
}
