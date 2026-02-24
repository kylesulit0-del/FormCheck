import * as THREE from 'three'
import type { MannequinRig } from '../mannequin/MannequinBuilder'
import type { JointName } from '../mannequin/mannequin.types'

/**
 * MuscleId — all highlightable muscle groups in FormCheck.
 * Used in ExerciseDefinition to declare primary/secondary involvement.
 */
export type MuscleId =
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'chest'
  | 'front-delts'
  | 'triceps'
  | 'lats'
  | 'traps'
  | 'rear-delts'
  | 'biceps'
  | 'core'
  | 'lower-back'
  | 'hip-flexors'

/**
 * ExerciseDefinition — the typed contract every exercise must satisfy.
 *
 * To add a new exercise:
 *   1. Create src/exercises/{name}.ts implementing this interface
 *   2. Register it in src/exercises/registry.ts
 *   See CONTRIBUTING.md for the complete workflow and code template.
 */
export interface ExerciseDefinition {
  /** Unique machine-readable ID (e.g. 'squat'). Used as registry key. */
  id: string

  /** Human-readable display name (e.g. 'Squat'). */
  name: string

  /** Primary muscles doing the most work. Highlighted in Phase 4. */
  primaryMuscles: MuscleId[]

  /** Secondary/stabiliser muscles. Shown with lighter highlighting. */
  secondaryMuscles: MuscleId[]

  /**
   * Difficulty level.
   * Not displayed in v1 but stored for future filtering/sorting.
   */
  difficulty: 'beginner' | 'intermediate' | 'advanced'

  /**
   * 3-5 short coaching cues displayed in the UI as step-by-step instructions.
   * Keep each cue concise (< 80 chars).
   */
  formSteps: string[]

  /**
   * At least 2 common mistakes with corrective cues.
   * Format: "Mistake — correction" (em dash separator).
   */
  commonMistakes: string[]

  /**
   * Short form-cue labels anchored to joints on the 3D mannequin.
   * Each cue specifies a joint anchor point and a short text label.
   */
  formCues?: { joint: JointName; text: string }[]

  /**
   * Whether this exercise has ghost equipment (e.g. ghost barbell overlay).
   * Drives Phase 3 equipment rendering. Set false until Phase 3 implements it.
   */
  hasGhostEquipment: boolean

  /**
   * Path to a GLB file with a skinned mesh + embedded animation.
   * When present, the app loads the GLB instead of using the procedural mannequin.
   * Example: '/models/exercises/squat.glb'
   */
  modelPath?: string

  /**
   * Which animation clip to play from the GLB file.
   * Defaults to the first clip if omitted.
   */
  animationClipName?: string

  /**
   * Build and return the THREE.AnimationClip for this exercise.
   *
   * @param rig - The live MannequinRig from buildMannequin().
   *              Use rig joints to look up bone names if needed.
   *              Use buildQuatTrack / buildClip from keyframe-utils.
   * @returns AnimationClip ready to hand to AnimationController.play()
   */
  buildAnimation: (rig: MannequinRig) => THREE.AnimationClip
}
