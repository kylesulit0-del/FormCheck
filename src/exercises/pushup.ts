import * as THREE from 'three'
import { buildQuatTrack, buildClip } from '../animation/keyframe-utils'
import { JointName } from '../mannequin/mannequin.types'
import type { MannequinRig } from '../mannequin/MannequinBuilder'
import type { ExerciseDefinition } from './types'

/**
 * Pushup exercise definition.
 *
 * Biomechanics: prone plank position (face-down).
 *  - Pelvis rotated 90° X (face down), body in straight line
 *  - Arms support bodyweight, elbows flex on descent
 *  - Shoulders flex to ~90° at bottom
 *
 * Animation: 2.5s per rep, seamless loop.
 */

function buildPushupClip(_rig: MannequinRig): THREE.AnimationClip {
  // Pelvis — 90° X for prone position (static)
  const pelvisTrack = buildQuatTrack(`${JointName.pelvis}.quaternion`, [
    { time: 0.0, x: 90, y: 0, z: 0 },
    { time: 2.5, x: 90, y: 0, z: 0 },
  ])

  // Spine — straight, minimal movement
  const spineTrack = buildQuatTrack(`${JointName.spine}.quaternion`, [
    { time: 0.0, x: 0, y: 0, z: 0 },
    { time: 2.5, x: 0, y: 0, z: 0 },
  ])

  // Shoulders — arms extended at top, flex at bottom
  const lShoulderTrack = buildQuatTrack(`${JointName.l_shoulder}.quaternion`, [
    { time: 0.0, x: -90, y: 0, z: -10 },  // top — arms extended below
    { time: 0.6, x: -80, y: 0, z: -15 },  // descending
    { time: 1.25, x: -70, y: 0, z: -20 }, // bottom — chest near ground
    { time: 1.9, x: -80, y: 0, z: -15 },  // ascending
    { time: 2.5, x: -90, y: 0, z: -10 },  // top — match start
  ])

  const rShoulderTrack = buildQuatTrack(`${JointName.r_shoulder}.quaternion`, [
    { time: 0.0, x: -90, y: 0, z: 10 },
    { time: 0.6, x: -80, y: 0, z: 15 },
    { time: 1.25, x: -70, y: 0, z: 20 },
    { time: 1.9, x: -80, y: 0, z: 15 },
    { time: 2.5, x: -90, y: 0, z: 10 },
  ])

  // Elbows — near full extension at top, ~90° at bottom
  const lElbowTrack = buildQuatTrack(`${JointName.l_elbow}.quaternion`, [
    { time: 0.0, x: 5,  y: 0, z: 0 },  // near-full extension
    { time: 0.6, x: 40, y: 0, z: 0 },
    { time: 1.25, x: 90, y: 0, z: 0 }, // 90° at bottom
    { time: 1.9, x: 40, y: 0, z: 0 },
    { time: 2.5, x: 5,  y: 0, z: 0 },
  ])

  const rElbowTrack = buildQuatTrack(`${JointName.r_elbow}.quaternion`, [
    { time: 0.0, x: 5,  y: 0, z: 0 },
    { time: 0.6, x: 40, y: 0, z: 0 },
    { time: 1.25, x: 90, y: 0, z: 0 },
    { time: 1.9, x: 40, y: 0, z: 0 },
    { time: 2.5, x: 5,  y: 0, z: 0 },
  ])

  // Hips — straight (plank position)
  const lHipTrack = buildQuatTrack(`${JointName.l_hip}.quaternion`, [
    { time: 0.0, x: 0, y: 0, z: 3 },
    { time: 2.5, x: 0, y: 0, z: 3 },
  ])

  const rHipTrack = buildQuatTrack(`${JointName.r_hip}.quaternion`, [
    { time: 0.0, x: 0, y: 0, z: -3 },
    { time: 2.5, x: 0, y: 0, z: -3 },
  ])

  // Knees — straight
  const lKneeTrack = buildQuatTrack(`${JointName.l_knee}.quaternion`, [
    { time: 0.0, x: 0, y: 0, z: 0 },
    { time: 2.5, x: 0, y: 0, z: 0 },
  ])

  const rKneeTrack = buildQuatTrack(`${JointName.r_knee}.quaternion`, [
    { time: 0.0, x: 0, y: 0, z: 0 },
    { time: 2.5, x: 0, y: 0, z: 0 },
  ])

  // Ankles — slight dorsiflexion (toes on ground)
  const lAnkleTrack = buildQuatTrack(`${JointName.l_ankle}.quaternion`, [
    { time: 0.0, x: -80, y: 0, z: 0 },
    { time: 2.5, x: -80, y: 0, z: 0 },
  ])

  const rAnkleTrack = buildQuatTrack(`${JointName.r_ankle}.quaternion`, [
    { time: 0.0, x: -80, y: 0, z: 0 },
    { time: 2.5, x: -80, y: 0, z: 0 },
  ])

  const tracks = [
    pelvisTrack,
    spineTrack,
    lShoulderTrack,
    rShoulderTrack,
    lElbowTrack,
    rElbowTrack,
    lHipTrack,
    rHipTrack,
    lKneeTrack,
    rKneeTrack,
    lAnkleTrack,
    rAnkleTrack,
  ]

  return buildClip('pushup', tracks, 2.5)
}

export const pushup: ExerciseDefinition = {
  id: 'pushup',
  name: 'Pushup',
  primaryMuscles: ['chest', 'triceps', 'front-delts'],
  secondaryMuscles: ['core'],
  difficulty: 'beginner',

  formSteps: [
    'Start in a high plank with hands slightly wider than shoulder-width',
    'Keep your body in a straight line from head to ankles',
    'Lower your chest toward the floor by bending your elbows to ~90°',
    'Keep elbows at about 45° from your torso, not flared out',
    'Push back up to full arm extension, squeezing your chest at the top',
  ],

  commonMistakes: [
    'Sagging hips — engage core to keep body in a straight line',
    'Flaring elbows wide — tuck elbows to ~45° to protect shoulders',
    'Incomplete range of motion — lower until chest is near the floor',
  ],

  hasGhostEquipment: false,
  buildAnimation: buildPushupClip,
}
