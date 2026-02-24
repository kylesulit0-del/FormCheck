import * as THREE from 'three'
import { buildQuatTrack, buildClip } from '../animation/keyframe-utils'
import { JointName } from '../mannequin/mannequin.types'
import type { MannequinRig } from '../mannequin/MannequinBuilder'
import type { ExerciseDefinition } from './types'

/**
 * Plank exercise definition.
 *
 * Biomechanics: static prone hold with subtle breathing motion.
 *  - Prone position (face down), body in straight line
 *  - Elbows at 90° (forearm plank), body straight from head to ankles
 *  - Subtle pelvis oscillation (~2°) to show the hold is animated
 *
 * Animation: 4s loop with breathing-like micro-movement.
 */

function buildPlankClip(_rig: MannequinRig): THREE.AnimationClip {
  // Pelvis — 90° X for prone, with subtle breathing oscillation
  const pelvisTrack = buildQuatTrack(`${JointName.pelvis}.quaternion`, [
    { time: 0.0, x: 90,   y: 0, z: 0 },
    { time: 1.0, x: 91,   y: 0, z: 0 },  // slight sag on exhale
    { time: 2.0, x: 90,   y: 0, z: 0 },  // return
    { time: 3.0, x: 91,   y: 0, z: 0 },  // slight sag again
    { time: 4.0, x: 90,   y: 0, z: 0 },  // match start
  ])

  // Spine — subtle breathing motion
  const spineTrack = buildQuatTrack(`${JointName.spine}.quaternion`, [
    { time: 0.0, x: 0,    y: 0, z: 0 },
    { time: 1.0, x: 1,    y: 0, z: 0 },
    { time: 2.0, x: 0,    y: 0, z: 0 },
    { time: 3.0, x: 1,    y: 0, z: 0 },
    { time: 4.0, x: 0,    y: 0, z: 0 },
  ])

  // Shoulders — flexed for forearm support
  const lShoulderTrack = buildQuatTrack(`${JointName.l_shoulder}.quaternion`, [
    { time: 0.0, x: -90, y: 0, z: -5 },
    { time: 4.0, x: -90, y: 0, z: -5 },
  ])

  const rShoulderTrack = buildQuatTrack(`${JointName.r_shoulder}.quaternion`, [
    { time: 0.0, x: -90, y: 0, z: 5 },
    { time: 4.0, x: -90, y: 0, z: 5 },
  ])

  // Elbows — 90° bend (forearm plank position)
  const lElbowTrack = buildQuatTrack(`${JointName.l_elbow}.quaternion`, [
    { time: 0.0, x: 90, y: 0, z: 0 },
    { time: 4.0, x: 90, y: 0, z: 0 },
  ])

  const rElbowTrack = buildQuatTrack(`${JointName.r_elbow}.quaternion`, [
    { time: 0.0, x: 90, y: 0, z: 0 },
    { time: 4.0, x: 90, y: 0, z: 0 },
  ])

  // Hips — straight (plank line)
  const lHipTrack = buildQuatTrack(`${JointName.l_hip}.quaternion`, [
    { time: 0.0, x: 0, y: 0, z: 3 },
    { time: 4.0, x: 0, y: 0, z: 3 },
  ])

  const rHipTrack = buildQuatTrack(`${JointName.r_hip}.quaternion`, [
    { time: 0.0, x: 0, y: 0, z: -3 },
    { time: 4.0, x: 0, y: 0, z: -3 },
  ])

  // Knees — straight
  const lKneeTrack = buildQuatTrack(`${JointName.l_knee}.quaternion`, [
    { time: 0.0, x: 0, y: 0, z: 0 },
    { time: 4.0, x: 0, y: 0, z: 0 },
  ])

  const rKneeTrack = buildQuatTrack(`${JointName.r_knee}.quaternion`, [
    { time: 0.0, x: 0, y: 0, z: 0 },
    { time: 4.0, x: 0, y: 0, z: 0 },
  ])

  // Ankles — toes on ground
  const lAnkleTrack = buildQuatTrack(`${JointName.l_ankle}.quaternion`, [
    { time: 0.0, x: -80, y: 0, z: 0 },
    { time: 4.0, x: -80, y: 0, z: 0 },
  ])

  const rAnkleTrack = buildQuatTrack(`${JointName.r_ankle}.quaternion`, [
    { time: 0.0, x: -80, y: 0, z: 0 },
    { time: 4.0, x: -80, y: 0, z: 0 },
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

  return buildClip('plank', tracks, 4.0)
}

export const plank: ExerciseDefinition = {
  id: 'plank',
  name: 'Plank',
  primaryMuscles: ['core', 'front-delts'],
  secondaryMuscles: ['glutes', 'quads'],
  difficulty: 'beginner',

  formSteps: [
    'Place forearms on the ground with elbows directly under shoulders',
    'Extend legs back, balancing on toes with feet hip-width apart',
    'Keep your body in a perfectly straight line from head to heels',
    'Engage your core by pulling your belly button toward your spine',
    'Breathe steadily — do not hold your breath during the hold',
  ],

  commonMistakes: [
    'Hips sagging toward the floor — squeeze glutes and brace core harder',
    'Hips piked too high — lower your hips until body forms a straight line',
    'Looking straight ahead — keep neck neutral, gaze at the floor below you',
  ],

  formCues: [
    { joint: JointName.neck, text: 'Neutral neck' },
    { joint: JointName.pelvis, text: 'Core engaged' },
    { joint: JointName.l_hip, text: 'Squeeze glutes' },
  ],

  hasGhostEquipment: false,
  buildAnimation: buildPlankClip,
}
