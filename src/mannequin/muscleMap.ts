import { SegmentName } from './mannequin.types'
import type { MuscleId } from '../exercises/types'

/**
 * Maps each MuscleId to the mannequin SegmentName(s) it highlights.
 */
export const muscleMap: Record<MuscleId, SegmentName[]> = {
  quads:        [SegmentName.thigh_l, SegmentName.thigh_r],
  hamstrings:   [SegmentName.thigh_l, SegmentName.thigh_r],
  glutes:       [SegmentName.glutes],
  calves:       [SegmentName.shin_l, SegmentName.shin_r],
  chest:        [SegmentName.chest],
  'front-delts': [SegmentName.upper_arm_l, SegmentName.upper_arm_r],
  triceps:      [SegmentName.forearm_l, SegmentName.forearm_r],
  lats:         [SegmentName.torso],
  traps:        [SegmentName.neck],
  'rear-delts': [SegmentName.upper_arm_l, SegmentName.upper_arm_r],
  biceps:       [SegmentName.forearm_l, SegmentName.forearm_r],
  core:         [SegmentName.core_front, SegmentName.torso],
  'lower-back': [SegmentName.lower_back],
  'hip-flexors': [SegmentName.thigh_l, SegmentName.thigh_r],
}
