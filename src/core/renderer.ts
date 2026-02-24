import * as THREE from 'three'

/**
 * Three.js rendering infrastructure.
 * Creates a WebGLRenderer, Scene, PerspectiveCamera, and lighting.
 * Appends the renderer canvas to a container div.
 */

// --- Scene ---
export const scene = new THREE.Scene()
scene.background = new THREE.Color(0x1a1a1a)

// --- Camera ---
// FOV 50, positioned ~3m back and ~1m up, looking toward the mannequin origin
export const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.01,
  100,
)
camera.position.set(0, 1.0, 3.0)
camera.lookAt(0, 0.9, 0)

// --- Renderer ---
export const renderer = new THREE.WebGLRenderer({
  antialias: true,
})
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

// Append canvas to container
let container = document.getElementById('canvas-container')
if (!container) {
  container = document.createElement('div')
  container.id = 'canvas-container'
  container.style.cssText = 'position:fixed;inset:0;'
  document.body.appendChild(container)
}
container.appendChild(renderer.domElement)
renderer.domElement.style.display = 'block'

// --- Lighting ---
// Ambient: soft overall fill so the figure isn't too dark in shadows
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
scene.add(ambientLight)

// Directional: primary key light from upper-right-front
const dirLight = new THREE.DirectionalLight(0xffffff, 1.2)
dirLight.position.set(2, 4, 3)
dirLight.castShadow = true
dirLight.shadow.mapSize.width = 1024
dirLight.shadow.mapSize.height = 1024
scene.add(dirLight)

// Fill light from opposite side (softer)
const fillLight = new THREE.DirectionalLight(0x8899bb, 0.3)
fillLight.position.set(-2, 1, -1)
scene.add(fillLight)

// --- Window resize handler ---
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})
