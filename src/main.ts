import './style.css'
import { scene, camera, renderer } from './core/renderer'
import { createRenderLoop } from './core/loop'
import { buildMannequin } from './mannequin/MannequinBuilder'
import { AnimationController } from './animation/AnimationController'
import { getExercise } from './exercises/registry'
import { appStore } from './core/store'

// Build mannequin and add to scene
const rig = buildMannequin()
scene.add(rig.root)

// Load the default exercise from the store and build its animation clip
const initialExerciseId = appStore.getState().selectedExerciseId
const exercise = getExercise(initialExerciseId)
const clip = exercise.buildAnimation(rig)

// Create AnimationController and begin looping the squat clip
const animationController = new AnimationController(rig.root)
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
