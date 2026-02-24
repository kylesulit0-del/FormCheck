import * as THREE from 'three'
import { SegmentName } from '../mannequin.types'

/**
 * Creates head and neck segment meshes.
 * Each mesh gets its own MeshStandardMaterial instance — required for independent highlighting.
 */
export function createHeadSegments(): {
  neckGroup: THREE.Group
  headGroup: THREE.Group
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

  // --- Neck ---
  const neckGroup = new THREE.Group()
  const neckMat = makeMat()
  const neckGeo = new THREE.CylinderGeometry(0.055, 0.065, 0.1, 12)
  const neckMesh = new THREE.Mesh(neckGeo, neckMat)
  neckMesh.name = SegmentName.neck
  neckMesh.position.set(0, 0.05, 0)
  neckGroup.add(neckMesh)
  materials.set(SegmentName.neck, neckMat)

  // --- Head ---
  const headGroup = new THREE.Group()
  const headMat = makeMat()
  // Slightly elongated sphere for head shape
  const headGeo = new THREE.SphereGeometry(0.11, 16, 16)
  const headMesh = new THREE.Mesh(headGeo, headMat)
  headMesh.name = SegmentName.head
  headMesh.scale.set(1.0, 1.2, 0.95)
  headMesh.position.set(0, 0.12, 0)
  headGroup.add(headMesh)
  materials.set(SegmentName.head, headMat)

  return { neckGroup, headGroup, materials }
}
