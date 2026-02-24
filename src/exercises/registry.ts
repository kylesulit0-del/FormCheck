import type { ExerciseDefinition } from './types'
import { squat } from './squat'
import { benchPress } from './benchPress'
import { pushup } from './pushup'
import { deadlift } from './deadlift'
import { plank } from './plank'

/**
 * Exercise registry — the single source of truth for all exercises.
 *
 * Keys are exercise IDs (matching ExerciseDefinition.id).
 * Values are the full ExerciseDefinition object.
 *
 * To add an exercise:
 *   1. Create src/exercises/{name}.ts (see CONTRIBUTING.md)
 *   2. Import it here and add to the Map below
 */
export const exerciseRegistry = new Map<string, ExerciseDefinition>([
  [squat.id, squat],
  [benchPress.id, benchPress],
  [pushup.id, pushup],
  [deadlift.id, deadlift],
  [plank.id, plank],
])

/**
 * Look up an exercise by ID.
 *
 * @param id - Exercise ID (e.g. 'squat')
 * @returns ExerciseDefinition for the given ID
 * @throws Error if no exercise with that ID is registered
 */
export function getExercise(id: string): ExerciseDefinition {
  const exercise = exerciseRegistry.get(id)
  if (!exercise) {
    throw new Error(
      `Exercise "${id}" not found in registry. ` +
      `Available exercises: ${[...exerciseRegistry.keys()].join(', ')}`,
    )
  }
  return exercise
}
