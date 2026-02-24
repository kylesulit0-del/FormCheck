import * as THREE from 'three'
import { SegmentName } from '../mannequin.types'

/**
 * Creates arm segment meshes (upper arm + forearm) for one side.
 * Each mesh gets its own MeshStandardMaterial instance — required for independent highlighting.
 */
function createArmSide(side: 'l' | 'r'): {
  upperArmGroup: THREE.Group
  forearmGroup: THREE.Group
  materials: Map<string, THREE.MeshStandardMaterial>
} {
  const materials = new Map<string, THREE.MeshStandardMaterial>()

  function makeMat(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: 0xd0d0d0,
      roughness: 0.85,
      metalness: 0.0,
    })
  }

  const upperArmSegName = side === 'l' ? SegmentName.upper_arm_l : SegmentName.upper_arm_r
  const forearmSegName = side === 'l' ? SegmentName.forearm_l : SegmentName.forearm_r

  // --- Upper arm ---
  const upperArmGroup = new THREE.Group()
  const upperArmMat = makeMat()
  const upperArmGeo = new THREE.CylinderGeometry(0.042, 0.038, 0.28, 12)
  const upperArmMesh = new THREE.Mesh(upperArmGeo, upperArmMat)
  upperArmMesh.name = upperArmSegName
  // Upper arm hangs down from shoulder joint — offset from shoulder pivot
  upperArmMesh.position.set(0, -0.14, 0)
  upperArmGroup.add(upperArmMesh)
  materials.set(upperArmSegName, upperArmMat)

  // Elbow joint sphere (visual connector)
  const elbowSphereGeo = new THREE.SphereGeometry(0.038, 10, 10)
  const elbowSphereMat = makeMat()
  const elbowSphere = new THREE.Mesh(elbowSphereGeo, elbowSphereMat)
  elbowSphere.position.set(0, -0.28, 0)
  upperArmGroup.add(elbowSphere)

  // --- Forearm ---
  const forearmGroup = new THREE.Group()
  const forearmMat = makeMat()
  const forearmGeo = new THREE.CylinderGeometry(0.034, 0.028, 0.26, 12)
  const forearmMesh = new THREE.Mesh(forearmGeo, forearmMat)
  forearmMesh.name = forearmSegName
  // Forearm hangs down from elbow joint
  forearmMesh.position.set(0, -0.13, 0)
  forearmGroup.add(forearmMesh)
  materials.set(forearmSegName, forearmMat)

  // Wrist/hand nub
  const wristGeo = new THREE.SphereGeometry(0.028, 10, 10)
  const wristMat = makeMat()
  const wristMesh = new THREE.Mesh(wristGeo, wristMat)
  wristMesh.position.set(0, -0.26, 0)
  forearmGroup.add(wristMesh)

  // Simple hand block
  const handGeo = new THREE.BoxGeometry(0.07, 0.09, 0.025)
  const handMat = makeMat()
  const handMesh = new THREE.Mesh(handGeo, handMat)
  handMesh.position.set(0, -0.31, 0)
  forearmGroup.add(handMesh)

  return { upperArmGroup, forearmGroup, materials }
}

/**
 * Creates leg segment meshes (thigh + shin + foot) for one side.
 * Each mesh gets its own MeshStandardMaterial instance — required for independent highlighting.
 */
function createLegSide(side: 'l' | 'r'): {
  thighGroup: THREE.Group
  shinGroup: THREE.Group
  materials: Map<string, THREE.MeshStandardMaterial>
} {
  const materials = new Map<string, THREE.MeshStandardMaterial>()

  function makeMat(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: 0xd0d0d0,
      roughness: 0.85,
      metalness: 0.0,
    })
  }

  const thighSegName = side === 'l' ? SegmentName.thigh_l : SegmentName.thigh_r
  const shinSegName = side === 'l' ? SegmentName.shin_l : SegmentName.shin_r

  // --- Thigh ---
  const thighGroup = new THREE.Group()
  const thighMat = makeMat()
  const thighGeo = new THREE.CylinderGeometry(0.07, 0.055, 0.42, 12)
  const thighMesh = new THREE.Mesh(thighGeo, thighMat)
  thighMesh.name = thighSegName
  thighMesh.position.set(0, -0.21, 0)
  thighGroup.add(thighMesh)
  materials.set(thighSegName, thighMat)

  // Knee joint sphere
  const kneeSphereGeo = new THREE.SphereGeometry(0.052, 10, 10)
  const kneeSphereMat = makeMat()
  const kneeSphere = new THREE.Mesh(kneeSphereGeo, kneeSphereMat)
  kneeSphere.position.set(0, -0.42, 0)
  thighGroup.add(kneeSphere)

  // --- Shin ---
  const shinGroup = new THREE.Group()
  const shinMat = makeMat()
  const shinGeo = new THREE.CylinderGeometry(0.048, 0.038, 0.4, 12)
  const shinMesh = new THREE.Mesh(shinGeo, shinMat)
  shinMesh.name = shinSegName
  shinMesh.position.set(0, -0.2, 0)
  shinGroup.add(shinMesh)
  materials.set(shinSegName, shinMat)

  // Ankle sphere
  const ankleSphereGeo = new THREE.SphereGeometry(0.038, 10, 10)
  const ankleSphereMat = makeMat()
  const ankleSphere = new THREE.Mesh(ankleSphereGeo, ankleSphereMat)
  ankleSphere.position.set(0, -0.40, 0)
  shinGroup.add(ankleSphere)

  // Foot
  const footGeo = new THREE.BoxGeometry(0.08, 0.04, 0.18)
  const footMat = makeMat()
  const footMesh = new THREE.Mesh(footGeo, footMat)
  footMesh.position.set(0, -0.44, 0.05)
  shinGroup.add(footMesh)

  return { thighGroup, shinGroup, materials }
}

/**
 * Creates both arms' segment groups and materials.
 */
export function createArms(): {
  lUpperArm: THREE.Group
  lForearm: THREE.Group
  rUpperArm: THREE.Group
  rForearm: THREE.Group
  materials: Map<string, THREE.MeshStandardMaterial>
} {
  const left = createArmSide('l')
  const right = createArmSide('r')
  const materials = new Map<string, THREE.MeshStandardMaterial>([
    ...left.materials,
    ...right.materials,
  ])
  return {
    lUpperArm: left.upperArmGroup,
    lForearm: left.forearmGroup,
    rUpperArm: right.upperArmGroup,
    rForearm: right.forearmGroup,
    materials,
  }
}

/**
 * Creates both legs' segment groups and materials.
 */
export function createLegs(): {
  lThigh: THREE.Group
  lShin: THREE.Group
  rThigh: THREE.Group
  rShin: THREE.Group
  materials: Map<string, THREE.MeshStandardMaterial>
} {
  const left = createLegSide('l')
  const right = createLegSide('r')
  const materials = new Map<string, THREE.MeshStandardMaterial>([
    ...left.materials,
    ...right.materials,
  ])
  return {
    lThigh: left.thighGroup,
    lShin: left.shinGroup,
    rThigh: right.thighGroup,
    rShin: right.shinGroup,
    materials,
  }
}
