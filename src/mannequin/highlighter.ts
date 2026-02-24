import * as THREE from 'three'
import type { MannequinRig } from './MannequinBuilder'
import type { ExerciseDefinition } from '../exercises/types'
import { muscleMap } from './muscleMap'

const DEFAULT_COLOR = 0xd0d0d0
const PRIMARY_COLOR = 0x6d8fff
const SECONDARY_COLOR = 0x4a5a80

/**
 * Highlight the mannequin segments corresponding to the exercise's
 * primary and secondary muscles. Primary wins if a segment is claimed by both.
 */
export function applyMuscleHighlights(
  rig: MannequinRig,
  exercise: ExerciseDefinition,
): void {
  // Reset all segments to default
  for (const mat of rig.segmentMaterials.values()) {
    mat.color.set(DEFAULT_COLOR)
  }

  // Secondary first (primary overwrites)
  for (const muscle of exercise.secondaryMuscles) {
    for (const seg of muscleMap[muscle] ?? []) {
      const mat = rig.segmentMaterials.get(seg)
      if (mat) mat.color.set(SECONDARY_COLOR)
    }
  }

  for (const muscle of exercise.primaryMuscles) {
    for (const seg of muscleMap[muscle] ?? []) {
      const mat = rig.segmentMaterials.get(seg)
      if (mat) mat.color.set(PRIMARY_COLOR)
    }
  }
}
