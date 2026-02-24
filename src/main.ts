import * as THREE from 'three'
import './style.css'
import { scene, camera, renderer } from './core/renderer'
import { createRenderLoop } from './core/loop'
import { buildMannequin } from './mannequin/MannequinBuilder'
import { AnimationController } from './animation/AnimationController'
import { getExercise } from './exercises/registry'
import { loadExerciseModel } from './loaders/modelLoader'
import { appStore } from './core/store'

async function init() {
  const initialExerciseId = appStore.getState().selectedExerciseId
  const exercise = getExercise(initialExerciseId)

  let animRoot: THREE.Object3D
  let clip: THREE.AnimationClip

  if (exercise.modelPath) {
    // GLB path: load the model and use its embedded animation
    const model = await loadExerciseModel(exercise.modelPath)
    scene.add(model.scene)
    animRoot = model.scene

    const clipName = exercise.animationClipName
    const found = clipName
      ? model.clips.find((c) => c.name === clipName)
      : model.clips[0]
    if (!found) {
      throw new Error(
        `No animation clip found in ${exercise.modelPath}` +
          (clipName ? ` (looking for "${clipName}")` : ''),
      )
    }
    clip = found
  } else {
    // Procedural fallback: build mannequin rig and generate clip programmatically
    const rig = buildMannequin()
    scene.add(rig.root)
    animRoot = rig.root
    clip = exercise.buildAnimation(rig)
  }

  // Create AnimationController and begin looping
  const animationController = new AnimationController(animRoot)
  animationController.play(clip)

  // Apply initial store state
  animationController.setPaused(!appStore.getState().isPlaying)
  animationController.setSpeed(appStore.getState().playbackSpeed)

  // Subscribe to Zustand store — react to isPlaying and playbackSpeed changes
  appStore.subscribe((state, prevState) => {
    if (state.isPlaying !== prevState.isPlaying) {
      animationController.setPaused(!state.isPlaying)
    }
    if (state.playbackSpeed !== prevState.playbackSpeed) {
      animationController.setSpeed(state.playbackSpeed)
    }
  })

  // Start render loop — call animationController.update() each frame
  const loop = createRenderLoop(renderer, scene, camera, () => {
    animationController.update()
  })
  loop.start()
}

init()
