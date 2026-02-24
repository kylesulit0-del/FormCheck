import * as THREE from 'three'

/**
 * Three.js rendering infrastructure.
 * Creates a WebGLRenderer, Scene, PerspectiveCamera, and lighting.
 * Call initRenderer(container) to mount the canvas into a DOM element.
 */

// --- Scene ---
export const scene = new THREE.Scene()
scene.background = new THREE.Color(0x1a1a1a)

// --- Camera ---
export const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 100)
camera.position.set(0, 1.0, 3.0)
camera.lookAt(0, 0.9, 0)

// --- Renderer ---
export const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setPixelRatio(window.devicePixelRatio)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

// --- Lighting ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
scene.add(ambientLight)

const dirLight = new THREE.DirectionalLight(0xffffff, 1.2)
dirLight.position.set(2, 4, 3)
dirLight.castShadow = true
dirLight.shadow.mapSize.width = 1024
dirLight.shadow.mapSize.height = 1024
scene.add(dirLight)

const fillLight = new THREE.DirectionalLight(0x8899bb, 0.3)
fillLight.position.set(-2, 1, -1)
scene.add(fillLight)

/**
 * Mount the renderer canvas into the given container and set up
 * a ResizeObserver for responsive sizing.
 */
export function initRenderer(container: HTMLElement): void {
  container.appendChild(renderer.domElement)
  renderer.domElement.style.display = 'block'

  function resize(width: number, height: number) {
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height, false)
  }

  // Initial size
  const { clientWidth, clientHeight } = container
  resize(clientWidth, clientHeight)

  // Observe container resizes
  const ro = new ResizeObserver((entries) => {
    const entry = entries[0]
    if (!entry) return
    const { width, height } = entry.contentRect
    if (width > 0 && height > 0) {
      resize(width, height)
    }
  })
  ro.observe(container)
}
