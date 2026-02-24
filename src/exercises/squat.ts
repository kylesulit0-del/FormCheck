import * as THREE from 'three'
import { buildQuatTrack, buildClip } from '../animation/keyframe-utils'
import { JointName } from '../mannequin/mannequin.types'
import type { MannequinRig } from '../mannequin/MannequinBuilder'
import type { ExerciseDefinition } from './types'

/**
 * Squat exercise definition.
 *
 * Biomechanics reference (barbell back squat):
 *  - Hip flexion at bottom: ~90-100 degrees
 *  - Knee flexion at bottom: ~120-130 degrees
 *  - Ankle dorsiflexion: ~15 degrees
 *  - Lumbar spine: slight forward lean ~15-20 degrees from vertical
 *  - Pelvis: anterior tilt / slight forward hinge as descent progresses
 *
 * Animation: 3 s per rep (1.5 s descent, 1.5 s ascent), looping seamlessly.
 * Timing is slightly non-linear — the athlete slows near the bottom to
 * simulate the "catch" phase, creating a more realistic feel.
 *
 * Joint rotation conventions (ZYX Euler, degrees):
 *  - Positive X = flex forward (hip/knee bending as in squat)
 *  - Negative X = extend (return to stand)
 *  - Y = abduction/adduction (slight knee tracking)
 *  - Z = rotation
 *
 * Track path format: `${JointName.xxx}.quaternion`
 */

/**
 * Keyframe timeline (in seconds):
 *   0.0  — standing (start / loop restart)
 *   0.6  — initial descent (~quarter squat)
 *   1.2  — mid-descent (~half squat)
 *   1.5  — full depth (bottom of squat)
 *   2.1  — mid-ascent (~half squat)
 *   2.7  — near lockout
 *   3.0  — standing (same as 0.0 for seamless loop)
 */

function buildSquatClip(_rig: MannequinRig): THREE.AnimationClip {
  // -------------------------------------------------------------------------
  // Pelvis — tilts forward (positive X) as athlete hinges into squat.
  // Also drops vertically in world space (handled by hip chain, not pelvis
  // position — pelvis rotation forward compensates for the depth).
  // -------------------------------------------------------------------------
  const pelvisTrack = buildQuatTrack(`${JointName.pelvis}.quaternion`, [
    { time: 0.0, x: 0,   y: 0, z: 0 },   // standing — neutral
    { time: 0.6, x: 10,  y: 0, z: 0 },   // initial tilt
    { time: 1.2, x: 18,  y: 0, z: 0 },   // mid descent
    { time: 1.5, x: 22,  y: 0, z: 0 },   // bottom — max anterior tilt
    { time: 2.1, x: 18,  y: 0, z: 0 },   // mid ascent
    { time: 2.7, x: 8,   y: 0, z: 0 },   // near lockout
    { time: 3.0, x: 0,   y: 0, z: 0 },   // standing — match frame 0 for seamless loop
  ])

  // -------------------------------------------------------------------------
  // Spine — slight forward lean carried through lumbar/thoracic.
  // spine sits just above pelvis; additional lean here gives realistic chest-down.
  // -------------------------------------------------------------------------
  const spineTrack = buildQuatTrack(`${JointName.spine}.quaternion`, [
    { time: 0.0, x: 0,   y: 0, z: 0 },
    { time: 0.6, x: 5,   y: 0, z: 0 },
    { time: 1.2, x: 10,  y: 0, z: 0 },
    { time: 1.5, x: 12,  y: 0, z: 0 },   // ~12 deg additional spine lean at bottom
    { time: 2.1, x: 10,  y: 0, z: 0 },
    { time: 2.7, x: 4,   y: 0, z: 0 },
    { time: 3.0, x: 0,   y: 0, z: 0 },
  ])

  // -------------------------------------------------------------------------
  // Hips (l_hip / r_hip) — primary flexion joint of the squat.
  // Hip joint flexes to ~90-95 degrees at bottom.
  // Slight outward rotation (Z) to track over toes.
  // -------------------------------------------------------------------------

  const lHipTrack = buildQuatTrack(`${JointName.l_hip}.quaternion`, [
    { time: 0.0, x: 0,    y: 0, z: 5 },   // slight external rotation at rest
    { time: 0.6, x: 30,   y: 0, z: 5 },
    { time: 1.2, x: 65,   y: 0, z: 5 },
    { time: 1.5, x: 92,   y: 0, z: 6 },   // ~92 degrees hip flexion at bottom
    { time: 2.1, x: 65,   y: 0, z: 5 },
    { time: 2.7, x: 25,   y: 0, z: 5 },
    { time: 3.0, x: 0,    y: 0, z: 5 },
  ])

  const rHipTrack = buildQuatTrack(`${JointName.r_hip}.quaternion`, [
    { time: 0.0, x: 0,    y: 0, z: -5 },  // mirror: negative Z for right
    { time: 0.6, x: 30,   y: 0, z: -5 },
    { time: 1.2, x: 65,   y: 0, z: -5 },
    { time: 1.5, x: 92,   y: 0, z: -6 },
    { time: 2.1, x: 65,   y: 0, z: -5 },
    { time: 2.7, x: 25,   y: 0, z: -5 },
    { time: 3.0, x: 0,    y: 0, z: -5 },
  ])

  // -------------------------------------------------------------------------
  // Knees (l_knee / r_knee) — flex to ~125 degrees at bottom.
  // Knees are already at the bottom of the thigh segment — positive X flexes them.
  // -------------------------------------------------------------------------

  const lKneeTrack = buildQuatTrack(`${JointName.l_knee}.quaternion`, [
    { time: 0.0, x: 0,    y: 0, z: 0 },
    { time: 0.6, x: 35,   y: 0, z: 0 },
    { time: 1.2, x: 80,   y: 0, z: 0 },
    { time: 1.5, x: 125,  y: 0, z: 0 },   // ~125 deg knee flexion at bottom
    { time: 2.1, x: 80,   y: 0, z: 0 },
    { time: 2.7, x: 30,   y: 0, z: 0 },
    { time: 3.0, x: 0,    y: 0, z: 0 },
  ])

  const rKneeTrack = buildQuatTrack(`${JointName.r_knee}.quaternion`, [
    { time: 0.0, x: 0,    y: 0, z: 0 },
    { time: 0.6, x: 35,   y: 0, z: 0 },
    { time: 1.2, x: 80,   y: 0, z: 0 },
    { time: 1.5, x: 125,  y: 0, z: 0 },
    { time: 2.1, x: 80,   y: 0, z: 0 },
    { time: 2.7, x: 30,   y: 0, z: 0 },
    { time: 3.0, x: 0,    y: 0, z: 0 },
  ])

  // -------------------------------------------------------------------------
  // Ankles — dorsiflexion (negative X in our convention: toes lift / shin
  // moves forward). ~15 degrees at bottom.
  // -------------------------------------------------------------------------

  const lAnkleTrack = buildQuatTrack(`${JointName.l_ankle}.quaternion`, [
    { time: 0.0, x: 0,    y: 0, z: 0 },
    { time: 0.6, x: -5,   y: 0, z: 0 },
    { time: 1.2, x: -12,  y: 0, z: 0 },
    { time: 1.5, x: -15,  y: 0, z: 0 },   // 15 deg dorsiflexion at bottom
    { time: 2.1, x: -12,  y: 0, z: 0 },
    { time: 2.7, x: -4,   y: 0, z: 0 },
    { time: 3.0, x: 0,    y: 0, z: 0 },
  ])

  const rAnkleTrack = buildQuatTrack(`${JointName.r_ankle}.quaternion`, [
    { time: 0.0, x: 0,    y: 0, z: 0 },
    { time: 0.6, x: -5,   y: 0, z: 0 },
    { time: 1.2, x: -12,  y: 0, z: 0 },
    { time: 1.5, x: -15,  y: 0, z: 0 },
    { time: 2.1, x: -12,  y: 0, z: 0 },
    { time: 2.7, x: -4,   y: 0, z: 0 },
    { time: 3.0, x: 0,    y: 0, z: 0 },
  ])

  const tracks = [
    pelvisTrack,
    spineTrack,
    lHipTrack,
    rHipTrack,
    lKneeTrack,
    rKneeTrack,
    lAnkleTrack,
    rAnkleTrack,
  ]

  return buildClip('squat', tracks, 3.0)
}

export const squat: ExerciseDefinition = {
  id: 'squat',
  name: 'Squat',

  primaryMuscles: ['quads', 'glutes'],
  secondaryMuscles: ['hamstrings', 'core', 'lower-back'],

  difficulty: 'beginner',

  formSteps: [
    'Feet shoulder-width apart, toes angled out 15-30 degrees',
    'Brace your core and take a deep breath before descending',
    'Push hips back and bend knees simultaneously, tracking over your toes',
    'Descend until thighs are parallel to the floor (or slightly below)',
    'Drive through your heels to stand, keeping chest up throughout',
  ],

  commonMistakes: [
    'Knees caving inward — actively push knees out over your pinky toes',
    'Heels rising off the floor — keep your weight distributed through your whole foot',
    'Excessive forward lean — improve ankle mobility and keep chest up',
  ],

  hasGhostEquipment: false,

  buildAnimation: buildSquatClip,
}
