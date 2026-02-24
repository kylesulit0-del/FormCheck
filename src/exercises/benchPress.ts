import * as THREE from 'three'
import { buildQuatTrack, buildClip } from '../animation/keyframe-utils'
import { JointName } from '../mannequin/mannequin.types'
import type { MannequinRig } from '../mannequin/MannequinBuilder'
import type { ExerciseDefinition } from './types'

/**
 * Bench Press exercise definition.
 *
 * Biomechanics: supine (face-up) on bench.
 *  - Pelvis rotated -90° X to lie flat on back
 *  - Shoulders flex to ~90° (arms pointing up)
 *  - Elbows flex/extend through the press
 *
 * Animation: 3s per rep, seamless loop.
 */

function buildBenchPressClip(_rig: MannequinRig): THREE.AnimationClip {
  // Pelvis — rotated -90° X for supine position (static)
  const pelvisTrack = buildQuatTrack(`${JointName.pelvis}.quaternion`, [
    { time: 0.0, x: -90, y: 0, z: 0 },
    { time: 3.0, x: -90, y: 0, z: 0 },
  ])

  // Spine — flat, no movement
  const spineTrack = buildQuatTrack(`${JointName.spine}.quaternion`, [
    { time: 0.0, x: 0, y: 0, z: 0 },
    { time: 3.0, x: 0, y: 0, z: 0 },
  ])

  // Shoulders — flex ~90° (arms pointing upward), slight abduction
  // Arms start extended (lockout) and lower to chest then press back up
  const lShoulderTrack = buildQuatTrack(`${JointName.l_shoulder}.quaternion`, [
    { time: 0.0, x: -90, y: 0, z: -10 },  // lockout — arms up
    { time: 0.8, x: -75, y: 0, z: -15 },  // lowering
    { time: 1.5, x: -60, y: 0, z: -20 },  // bottom — bar at chest
    { time: 2.2, x: -75, y: 0, z: -15 },  // pressing up
    { time: 3.0, x: -90, y: 0, z: -10 },  // lockout — match start
  ])

  const rShoulderTrack = buildQuatTrack(`${JointName.r_shoulder}.quaternion`, [
    { time: 0.0, x: -90, y: 0, z: 10 },
    { time: 0.8, x: -75, y: 0, z: 15 },
    { time: 1.5, x: -60, y: 0, z: 20 },
    { time: 2.2, x: -75, y: 0, z: 15 },
    { time: 3.0, x: -90, y: 0, z: 10 },
  ])

  // Elbows — extend at top, flex ~90° at bottom
  const lElbowTrack = buildQuatTrack(`${JointName.l_elbow}.quaternion`, [
    { time: 0.0, x: 5,   y: 0, z: 0 },  // near-full extension
    { time: 0.8, x: 40,  y: 0, z: 0 },
    { time: 1.5, x: 90,  y: 0, z: 0 },  // 90° bend at bottom
    { time: 2.2, x: 40,  y: 0, z: 0 },
    { time: 3.0, x: 5,   y: 0, z: 0 },
  ])

  const rElbowTrack = buildQuatTrack(`${JointName.r_elbow}.quaternion`, [
    { time: 0.0, x: 5,   y: 0, z: 0 },
    { time: 0.8, x: 40,  y: 0, z: 0 },
    { time: 1.5, x: 90,  y: 0, z: 0 },
    { time: 2.2, x: 40,  y: 0, z: 0 },
    { time: 3.0, x: 5,   y: 0, z: 0 },
  ])

  // Hips — straight (lying flat)
  const lHipTrack = buildQuatTrack(`${JointName.l_hip}.quaternion`, [
    { time: 0.0, x: 0, y: 0, z: 5 },
    { time: 3.0, x: 0, y: 0, z: 5 },
  ])

  const rHipTrack = buildQuatTrack(`${JointName.r_hip}.quaternion`, [
    { time: 0.0, x: 0, y: 0, z: -5 },
    { time: 3.0, x: 0, y: 0, z: -5 },
  ])

  // Knees — slight bend for foot placement
  const lKneeTrack = buildQuatTrack(`${JointName.l_knee}.quaternion`, [
    { time: 0.0, x: 70, y: 0, z: 0 },
    { time: 3.0, x: 70, y: 0, z: 0 },
  ])

  const rKneeTrack = buildQuatTrack(`${JointName.r_knee}.quaternion`, [
    { time: 0.0, x: 70, y: 0, z: 0 },
    { time: 3.0, x: 70, y: 0, z: 0 },
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
  ]

  return buildClip('benchPress', tracks, 3.0)
}

export const benchPress: ExerciseDefinition = {
  id: 'bench-press',
  name: 'Bench Press',
  primaryMuscles: ['chest', 'triceps', 'front-delts'],
  secondaryMuscles: ['core'],
  difficulty: 'beginner',

  formSteps: [
    'Lie flat on the bench with eyes under the bar',
    'Grip the bar slightly wider than shoulder-width, wrists straight',
    'Unrack and hold the bar over your chest with arms extended',
    'Lower the bar to mid-chest, keeping elbows at ~45° from torso',
    'Press the bar up and slightly back to lockout over your shoulders',
  ],

  commonMistakes: [
    'Flaring elbows to 90° — keep them at 45° to protect shoulders',
    'Bouncing bar off chest — pause briefly at the bottom for control',
    'Lifting hips off bench — maintain contact to protect lower back',
  ],

  hasGhostEquipment: false,
  buildAnimation: buildBenchPressClip,
}
