/**
 * JointName enum — FROZEN animation contract.
 * These values are used as Object3D.name AND animation track path prefixes.
 * A mismatch causes silent animation failure. Do NOT rename after Phase 1.
 */
export enum JointName {
  pelvis = 'pelvis',
  spine = 'spine',
  chest = 'chest',
  neck = 'neck',
  head = 'head',
  l_shoulder = 'l_shoulder',
  l_elbow = 'l_elbow',
  l_wrist = 'l_wrist',
  r_shoulder = 'r_shoulder',
  r_elbow = 'r_elbow',
  r_wrist = 'r_wrist',
  l_hip = 'l_hip',
  l_knee = 'l_knee',
  l_ankle = 'l_ankle',
  r_hip = 'r_hip',
  r_knee = 'r_knee',
  r_ankle = 'r_ankle',
}

/**
 * SegmentName enum — highlightable mesh regions.
 * Used as keys in MannequinRig.segmentMaterials for independent color control.
 */
export enum SegmentName {
  torso = 'torso',
  chest = 'chest',
  upper_arm_l = 'upper_arm_l',
  upper_arm_r = 'upper_arm_r',
  forearm_l = 'forearm_l',
  forearm_r = 'forearm_r',
  thigh_l = 'thigh_l',
  thigh_r = 'thigh_r',
  shin_l = 'shin_l',
  shin_r = 'shin_r',
  head = 'head',
  neck = 'neck',
  glutes = 'glutes',
  lower_back = 'lower_back',
  core_front = 'core_front',
}
