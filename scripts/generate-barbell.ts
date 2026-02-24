/**
 * Generates a programmatic barbell GLB using @gltf-transform/core.
 *
 * Barbell geometry (Y-axis is up, centered at origin):
 *   - Center bar: thin cylinder along X-axis, 1.8m long, 0.025m radius
 *   - Two weight plates: one on each end, 0.225m radius, 0.03m thick
 *   - Two collars: between plates and bar grip zone, 0.032m radius, 0.04m thick
 *
 * Run: npx tsx scripts/generate-barbell.ts
 */

import { Document, NodeIO } from '@gltf-transform/core'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { writeFileSync, mkdirSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const OUTPUT_PATH = join(__dirname, '../public/models/barbell-raw.glb')

// ---------------------------------------------------------------------------
// Geometry helpers
// ---------------------------------------------------------------------------

interface CylinderParams {
  radiusTop: number
  radiusBottom: number
  height: number
  radialSegments: number
  heightSegments: number
}

function buildCylinder(params: CylinderParams): {
  positions: Float32Array
  normals: Float32Array
  indices: Uint16Array
} {
  const { radiusTop, radiusBottom, height, radialSegments, heightSegments } = params
  const positions: number[] = []
  const normals: number[] = []
  const indices: number[] = []

  // Generate side vertices
  for (let y = 0; y <= heightSegments; y++) {
    const v = y / heightSegments
    const radius = radiusBottom + (radiusTop - radiusBottom) * v
    const yPos = -height / 2 + v * height

    for (let x = 0; x <= radialSegments; x++) {
      const u = x / radialSegments
      const theta = u * Math.PI * 2

      const sinTheta = Math.sin(theta)
      const cosTheta = Math.cos(theta)

      positions.push(radius * sinTheta, yPos, radius * cosTheta)

      // Normal for a cone/cylinder side
      const slope = (radiusBottom - radiusTop) / height
      const normalLen = Math.sqrt(1 + slope * slope)
      normals.push(sinTheta / normalLen, slope / normalLen, cosTheta / normalLen)
    }
  }

  // Generate side indices
  for (let y = 0; y < heightSegments; y++) {
    for (let x = 0; x < radialSegments; x++) {
      const a = (radialSegments + 1) * y + x
      const b = (radialSegments + 1) * (y + 1) + x
      const c = (radialSegments + 1) * (y + 1) + x + 1
      const d = (radialSegments + 1) * y + x + 1
      indices.push(a, b, d)
      indices.push(b, c, d)
    }
  }

  // Top cap
  const topCenterIdx = positions.length / 3
  positions.push(0, height / 2, 0)
  normals.push(0, 1, 0)

  const topStartIdx = positions.length / 3
  for (let x = 0; x <= radialSegments; x++) {
    const u = x / radialSegments
    const theta = u * Math.PI * 2
    positions.push(radiusTop * Math.sin(theta), height / 2, radiusTop * Math.cos(theta))
    normals.push(0, 1, 0)
  }
  for (let x = 0; x < radialSegments; x++) {
    indices.push(topCenterIdx, topStartIdx + x + 1, topStartIdx + x)
  }

  // Bottom cap
  const botCenterIdx = positions.length / 3
  positions.push(0, -height / 2, 0)
  normals.push(0, -1, 0)

  const botStartIdx = positions.length / 3
  for (let x = 0; x <= radialSegments; x++) {
    const u = x / radialSegments
    const theta = u * Math.PI * 2
    positions.push(radiusBottom * Math.sin(theta), -height / 2, radiusBottom * Math.cos(theta))
    normals.push(0, -1, 0)
  }
  for (let x = 0; x < radialSegments; x++) {
    indices.push(botCenterIdx, botStartIdx + x, botStartIdx + x + 1)
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    indices: new Uint16Array(indices),
  }
}

/**
 * Rotate positions/normals from Y-up to X-axis aligned (rotate 90° around Z)
 * so the bar lies along the X axis.
 */
function rotateToXAxis(positions: Float32Array, normals: Float32Array): void {
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i]
    const y = positions[i + 1]
    // Rotate 90° around Z: newX = -y, newY = x
    positions[i] = -y
    positions[i + 1] = x
  }
  for (let i = 0; i < normals.length; i += 3) {
    const nx = normals[i]
    const ny = normals[i + 1]
    normals[i] = -ny
    normals[i + 1] = nx
  }
}

/**
 * Translate positions by (dx, dy, dz)
 */
function translatePositions(positions: Float32Array, dx: number, dy: number, dz: number): void {
  for (let i = 0; i < positions.length; i += 3) {
    positions[i] += dx
    positions[i + 1] += dy
    positions[i + 2] += dz
  }
}

// ---------------------------------------------------------------------------
// Build barbell document
// ---------------------------------------------------------------------------

async function main() {
  const doc = new Document()
  const buffer = doc.createBuffer()

  // Create a light-gray material (ghost equipment tone)
  const material = doc.createMaterial('barbell-ghost')
    .setBaseColorFactor([0.85, 0.85, 0.85, 1.0])
    .setMetallicFactor(0.8)
    .setRoughnessFactor(0.3)

  const scene = doc.createScene('Scene')
  const rootNode = doc.createNode('Barbell')
  scene.addChild(rootNode)

  // Helper: add a mesh part to the scene
  function addPart(name: string, geo: ReturnType<typeof buildCylinder>, xOffset: number) {
    translatePositions(geo.positions, xOffset, 0, 0)

    const posAccessor = doc.createAccessor()
      .setType('VEC3')
      .setArray(geo.positions)
      .setBuffer(buffer)

    const normAccessor = doc.createAccessor()
      .setType('VEC3')
      .setArray(geo.normals)
      .setBuffer(buffer)

    const idxAccessor = doc.createAccessor()
      .setType('SCALAR')
      .setArray(geo.indices)
      .setBuffer(buffer)

    const prim = doc.createPrimitive()
      .setAttribute('POSITION', posAccessor)
      .setAttribute('NORMAL', normAccessor)
      .setIndices(idxAccessor)
      .setMaterial(material)

    const mesh = doc.createMesh(name).addPrimitive(prim)
    const node = doc.createNode(name).setMesh(mesh)
    rootNode.addChild(node)
  }

  // --- Center bar ---
  // 1.8m long, 0.025m radius, along X axis
  const barGeo = buildCylinder({
    radiusTop: 0.025,
    radiusBottom: 0.025,
    height: 1.8,
    radialSegments: 12,
    heightSegments: 1,
  })
  rotateToXAxis(barGeo.positions, barGeo.normals)
  addPart('Bar', barGeo, 0)

  // --- Weight plates (left and right) ---
  // Each plate: 0.225m radius, 0.03m thick
  // Placed at ±0.85m from center (just inside the bar ends at ±0.9m)
  for (const side of [-1, 1] as const) {
    const plateGeo = buildCylinder({
      radiusTop: 0.225,
      radiusBottom: 0.225,
      height: 0.03,
      radialSegments: 16,
      heightSegments: 1,
    })
    rotateToXAxis(plateGeo.positions, plateGeo.normals)
    addPart(`Plate_${side === -1 ? 'L' : 'R'}`, plateGeo, side * 0.82)
  }

  // --- Collars (left and right) ---
  // Each collar: 0.032m radius, 0.04m thick
  // Placed between grip area and plates at ±0.6m
  for (const side of [-1, 1] as const) {
    const collarGeo = buildCylinder({
      radiusTop: 0.032,
      radiusBottom: 0.032,
      height: 0.04,
      radialSegments: 10,
      heightSegments: 1,
    })
    rotateToXAxis(collarGeo.positions, collarGeo.normals)
    addPart(`Collar_${side === -1 ? 'L' : 'R'}`, collarGeo, side * 0.60)
  }

  // Write GLB
  const io = new NodeIO()
  const glb = await io.writeBinary(doc)

  mkdirSync(join(__dirname, '../public/models'), { recursive: true })
  writeFileSync(OUTPUT_PATH, glb)

  const sizeKB = (glb.byteLength / 1024).toFixed(1)
  console.log(`Generated barbell-raw.glb: ${OUTPUT_PATH} (${sizeKB} KB, ${glb.byteLength} bytes)`)
}

main().catch(err => {
  console.error('Error generating barbell:', err)
  process.exit(1)
})
