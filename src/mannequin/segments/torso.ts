import * as THREE from 'three'
import { SegmentName } from '../mannequin.types'

/**
 * Creates torso segment meshes (pelvis/lower back, abdomen, chest/glutes).
 * Each mesh gets its own MeshStandardMaterial instance — required for independent highlighting.
 * @returns An object with mesh groups and their associated materials.
 */
export function createTorsoSegments(): {
  meshes: THREE.Group
  materials: Map<string, THREE.MeshStandardMaterial>
} {
  const group = new THREE.Group()
  const materials = new Map<string, THREE.MeshStandardMaterial>()

  // Helper: create a standard material with independent instance
  function makeMat(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: 0xd0d0d0,
      roughness: 0.85,
      metalness: 0.0,
    })
  }

  // --- Pelvis / Glutes region ---
  // Slightly wider than waist, centered at local origin (pelvis joint is origin)
  const glutesMat = makeMat()
  const glutesGeo = new THREE.CylinderGeometry(0.14, 0.16, 0.18, 16)
  const glutesMesh = new THREE.Mesh(glutesGeo, glutesMat)
  glutesMesh.name = SegmentName.glutes
  // Sit below pelvis joint center
  glutesMesh.position.set(0, -0.04, 0.01)
  group.add(glutesMesh)
  materials.set(SegmentName.glutes, glutesMat)

  // --- Lower back ---
  const lowerBackMat = makeMat()
  const lowerBackGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.12, 16)
  const lowerBackMesh = new THREE.Mesh(lowerBackGeo, lowerBackMat)
  lowerBackMesh.name = SegmentName.lower_back
  lowerBackMesh.position.set(0, 0.06, -0.02)
  group.add(lowerBackMesh)
  materials.set(SegmentName.lower_back, lowerBackMat)

  // --- Torso (abdomen) — runs from pelvis to chest ---
  const torsoMat = makeMat()
  const torsoGeo = new THREE.CylinderGeometry(0.13, 0.14, 0.22, 16)
  const torsoMesh = new THREE.Mesh(torsoGeo, torsoMat)
  torsoMesh.name = SegmentName.torso
  torsoMesh.position.set(0, 0.18, 0)
  group.add(torsoMesh)
  materials.set(SegmentName.torso, torsoMat)

  // --- Core front (ab region) ---
  const coreFrontMat = makeMat()
  const coreFrontGeo = new THREE.CylinderGeometry(0.11, 0.13, 0.18, 16)
  const coreFrontMesh = new THREE.Mesh(coreFrontGeo, coreFrontMat)
  coreFrontMesh.name = SegmentName.core_front
  coreFrontMesh.position.set(0, 0.16, 0.03)
  group.add(coreFrontMesh)
  materials.set(SegmentName.core_front, coreFrontMat)

  // --- Chest (upper torso) ---
  const chestMat = makeMat()
  const chestGeo = new THREE.CylinderGeometry(0.16, 0.13, 0.22, 16)
  const chestMesh = new THREE.Mesh(chestGeo, chestMat)
  chestMesh.name = SegmentName.chest
  chestMesh.position.set(0, 0.38, 0)
  group.add(chestMesh)
  materials.set(SegmentName.chest, chestMat)

  // --- Shoulder joint spheres (visual connectors, part of torso group) ---
  const shoulderSphereGeo = new THREE.SphereGeometry(0.075, 12, 12)

  // Left shoulder sphere
  const lShoulderMat = makeMat()
  const lShoulderSphere = new THREE.Mesh(shoulderSphereGeo, lShoulderMat)
  lShoulderSphere.position.set(0.22, 0.44, 0)
  group.add(lShoulderSphere)

  // Right shoulder sphere
  const rShoulderMat = makeMat()
  const rShoulderSphere = new THREE.Mesh(shoulderSphereGeo, rShoulderMat)
  rShoulderSphere.position.set(-0.22, 0.44, 0)
  group.add(rShoulderSphere)

  // --- Hip joint spheres ---
  const hipSphereGeo = new THREE.SphereGeometry(0.07, 12, 12)

  const lHipMat = makeMat()
  const lHipSphere = new THREE.Mesh(hipSphereGeo, lHipMat)
  lHipSphere.position.set(0.1, -0.06, 0)
  group.add(lHipSphere)

  const rHipMat = makeMat()
  const rHipSphere = new THREE.Mesh(hipSphereGeo, rHipMat)
  rHipSphere.position.set(-0.1, -0.06, 0)
  group.add(rHipSphere)

  return { meshes: group, materials }
}
