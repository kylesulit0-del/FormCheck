import * as THREE from 'three'
import { buildQuatTrack, buildClip } from '../animation/keyframe-utils'
import { JointName } from '../mannequin/mannequin.types'
import type { MannequinRig } from '../mannequin/MannequinBuilder'
import type { ExerciseDefinition } from './types'

/**
 * Deadlift exercise definition.
 *
 * Biomechanics: standing hip hinge.
 *  - Pelvis tilts forward ~60-70° at bottom
 *  - Knees slight bend (~20-30°), spine neutral
 *  - Arms hang straight (no elbow bend)
 *
 * Animation: 3s per rep, seamless loop.
 */

function buildDeadliftClip(_rig: MannequinRig): THREE.AnimationClip {
  // Pelvis — major forward tilt (hip hinge)
  const pelvisTrack = buildQuatTrack(`${JointName.pelvis}.quaternion`, [
    { time: 0.0, x: 0,   y: 0, z: 0 },   // standing
    { time: 0.5, x: 20,  y: 0, z: 0 },   // initial hinge
    { time: 1.0, x: 45,  y: 0, z: 0 },   // mid descent
    { time: 1.5, x: 65,  y: 0, z: 0 },   // bottom — bar at shins
    { time: 2.0, x: 45,  y: 0, z: 0 },   // mid ascent
    { time: 2.5, x: 18,  y: 0, z: 0 },   // near lockout
    { time: 3.0, x: 0,   y: 0, z: 0 },   // standing — match start
  ])

  // Spine — stays neutral (slight extension to keep back flat)
  const spineTrack = buildQuatTrack(`${JointName.spine}.quaternion`, [
    { time: 0.0, x: 0,   y: 0, z: 0 },
    { time: 0.5, x: -3,  y: 0, z: 0 },   // slight extension to stay neutral
    { time: 1.0, x: -5,  y: 0, z: 0 },
    { time: 1.5, x: -6,  y: 0, z: 0 },   // counteracting pelvis forward tilt
    { time: 2.0, x: -5,  y: 0, z: 0 },
    { time: 2.5, x: -3,  y: 0, z: 0 },
    { time: 3.0, x: 0,   y: 0, z: 0 },
  ])

  // Hips — slight flexion (less than squat, this is a hinge pattern)
  const lHipTrack = buildQuatTrack(`${JointName.l_hip}.quaternion`, [
    { time: 0.0, x: 0,    y: 0, z: 3 },
    { time: 0.5, x: 8,    y: 0, z: 3 },
    { time: 1.0, x: 15,   y: 0, z: 3 },
    { time: 1.5, x: 20,   y: 0, z: 3 },   // slight hip flexion at bottom
    { time: 2.0, x: 15,   y: 0, z: 3 },
    { time: 2.5, x: 6,    y: 0, z: 3 },
    { time: 3.0, x: 0,    y: 0, z: 3 },
  ])

  const rHipTrack = buildQuatTrack(`${JointName.r_hip}.quaternion`, [
    { time: 0.0, x: 0,    y: 0, z: -3 },
    { time: 0.5, x: 8,    y: 0, z: -3 },
    { time: 1.0, x: 15,   y: 0, z: -3 },
    { time: 1.5, x: 20,   y: 0, z: -3 },
    { time: 2.0, x: 15,   y: 0, z: -3 },
    { time: 2.5, x: 6,    y: 0, z: -3 },
    { time: 3.0, x: 0,    y: 0, z: -3 },
  ])

  // Knees — slight bend (~25°) at bottom
  const lKneeTrack = buildQuatTrack(`${JointName.l_knee}.quaternion`, [
    { time: 0.0, x: 0,    y: 0, z: 0 },
    { time: 0.5, x: 8,    y: 0, z: 0 },
    { time: 1.0, x: 18,   y: 0, z: 0 },
    { time: 1.5, x: 25,   y: 0, z: 0 },   // slight knee bend
    { time: 2.0, x: 18,   y: 0, z: 0 },
    { time: 2.5, x: 6,    y: 0, z: 0 },
    { time: 3.0, x: 0,    y: 0, z: 0 },
  ])

  const rKneeTrack = buildQuatTrack(`${JointName.r_knee}.quaternion`, [
    { time: 0.0, x: 0,    y: 0, z: 0 },
    { time: 0.5, x: 8,    y: 0, z: 0 },
    { time: 1.0, x: 18,   y: 0, z: 0 },
    { time: 1.5, x: 25,   y: 0, z: 0 },
    { time: 2.0, x: 18,   y: 0, z: 0 },
    { time: 2.5, x: 6,    y: 0, z: 0 },
    { time: 3.0, x: 0,    y: 0, z: 0 },
  ])

  // Shoulders — arms hang straight, follow body angle
  const lShoulderTrack = buildQuatTrack(`${JointName.l_shoulder}.quaternion`, [
    { time: 0.0, x: 0,  y: 0, z: 0 },
    { time: 1.5, x: 0,  y: 0, z: 0 },   // arms hang — gravity keeps them down
    { time: 3.0, x: 0,  y: 0, z: 0 },
  ])

  const rShoulderTrack = buildQuatTrack(`${JointName.r_shoulder}.quaternion`, [
    { time: 0.0, x: 0,  y: 0, z: 0 },
    { time: 1.5, x: 0,  y: 0, z: 0 },
    { time: 3.0, x: 0,  y: 0, z: 0 },
  ])

  // Elbows — straight throughout
  const lElbowTrack = buildQuatTrack(`${JointName.l_elbow}.quaternion`, [
    { time: 0.0, x: 0, y: 0, z: 0 },
    { time: 3.0, x: 0, y: 0, z: 0 },
  ])

  const rElbowTrack = buildQuatTrack(`${JointName.r_elbow}.quaternion`, [
    { time: 0.0, x: 0, y: 0, z: 0 },
    { time: 3.0, x: 0, y: 0, z: 0 },
  ])

  const tracks = [
    pelvisTrack,
    spineTrack,
    lHipTrack,
    rHipTrack,
    lKneeTrack,
    rKneeTrack,
    lShoulderTrack,
    rShoulderTrack,
    lElbowTrack,
    rElbowTrack,
  ]

  return buildClip('deadlift', tracks, 3.0)
}

export const deadlift: ExerciseDefinition = {
  id: 'deadlift',
  name: 'Deadlift',
  primaryMuscles: ['hamstrings', 'glutes', 'lower-back'],
  secondaryMuscles: ['quads', 'core', 'traps'],
  difficulty: 'intermediate',

  formSteps: [
    'Stand with feet hip-width apart, bar over mid-foot',
    'Hinge at the hips and grip the bar just outside your knees',
    'Flatten your back, brace your core, and pull slack out of the bar',
    'Drive through your feet, extending hips and knees together',
    'Lock out by squeezing glutes at the top, shoulders back',
  ],

  commonMistakes: [
    'Rounding the lower back — maintain a neutral spine throughout the lift',
    'Jerking the bar off the floor — build tension gradually before pulling',
    'Bar drifting away from body — keep the bar close to your shins and thighs',
  ],

  formCues: [
    { joint: JointName.spine, text: 'Neutral spine' },
    { joint: JointName.l_ankle, text: 'Push floor away' },
    { joint: JointName.l_wrist, text: 'Bar close to body' },
  ],

  hasGhostEquipment: false,
  buildAnimation: buildDeadliftClip,
}
