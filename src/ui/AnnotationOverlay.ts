import * as THREE from 'three'
import { appStore } from '../core/store'
import { getRigJoints } from '../core/rigRef'
import { getExercise } from '../exercises/registry'
import { camera } from '../core/renderer'

const tmpVec3 = new THREE.Vector3()

/**
 * Mounts annotation overlay labels that track rig joints in screen space.
 * Labels float next to body parts on the 3D mannequin, updating each frame.
 */
export function mountAnnotationOverlay(container: HTMLElement): void {
  const wrapper = document.createElement('div')
  wrapper.className = 'absolute inset-0 pointer-events-none overflow-hidden'
  wrapper.style.zIndex = '5'

  let labels: HTMLDivElement[] = []
  let currentExerciseId = ''

  function rebuildLabels() {
    // Remove old labels
    for (const el of labels) el.remove()
    labels = []

    const { selectedExerciseId } = appStore.getState()
    currentExerciseId = selectedExerciseId
    const exercise = getExercise(selectedExerciseId)
    if (!exercise.formCues) return

    for (const cue of exercise.formCues) {
      const el = document.createElement('div')
      el.textContent = cue.text
      el.className =
        'absolute whitespace-nowrap bg-surface/90 text-white/90 text-[10px] ' +
        'px-1.5 py-0.5 rounded-full backdrop-blur-sm border border-white/10'
      el.dataset.joint = cue.joint
      wrapper.appendChild(el)
      labels.push(el)
    }
  }

  function tick() {
    const { selectedExerciseId, showAnnotations } = appStore.getState()

    // Rebuild labels if exercise changed
    if (selectedExerciseId !== currentExerciseId) {
      rebuildLabels()
    }

    const joints = getRigJoints()
    const exercise = getExercise(selectedExerciseId)
    const cues = exercise.formCues

    if (!showAnnotations || !joints || !cues || labels.length === 0) {
      for (const el of labels) el.style.display = 'none'
      rafId = requestAnimationFrame(tick)
      return
    }

    const w = wrapper.clientWidth
    const h = wrapper.clientHeight

    for (let i = 0; i < labels.length; i++) {
      const el = labels[i]
      const jointName = el.dataset.joint!
      const joint = joints.get(jointName)

      if (!joint) {
        el.style.display = 'none'
        continue
      }

      joint.getWorldPosition(tmpVec3)
      tmpVec3.project(camera)

      // Behind camera — hide
      if (tmpVec3.z > 1) {
        el.style.display = 'none'
        continue
      }

      const x = (tmpVec3.x * 0.5 + 0.5) * w
      const y = (-tmpVec3.y * 0.5 + 0.5) * h

      // Off-screen — hide
      if (x < -50 || x > w + 50 || y < -50 || y > h + 50) {
        el.style.display = 'none'
        continue
      }

      el.style.display = ''
      el.style.left = `${x + 12}px`
      el.style.top = `${y - 8}px`
    }

    rafId = requestAnimationFrame(tick)
  }

  let rafId = requestAnimationFrame(tick)

  // Clean up on removal
  wrapper.addEventListener('DOMNodeRemovedFromDocument', () => {
    cancelAnimationFrame(rafId)
  })

  // Initial build
  rebuildLabels()

  container.appendChild(wrapper)
}
