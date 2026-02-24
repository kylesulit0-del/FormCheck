import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import './style.css'
import { scene, camera, renderer, initRenderer } from './core/renderer'
import { createRenderLoop } from './core/loop'
import { buildMannequin } from './mannequin/MannequinBuilder'
import type { MannequinRig } from './mannequin/MannequinBuilder'
import { AnimationController } from './animation/AnimationController'
import { getExercise } from './exercises/registry'
import { loadExerciseModel } from './loaders/modelLoader'
import { appStore } from './core/store'
import { mountExerciseSelector } from './ui/ExerciseSelector'
import { mountFormGuide } from './ui/FormGuide'
import { mountPlaybackOverlay } from './ui/PlaybackOverlay'
import { registerControls } from './core/cameraPresets'
import { setAnimationController } from './core/animationRef'
import { setRigJoints } from './core/rigRef'
import { applyMuscleHighlights } from './mannequin/highlighter'
import { mountAnnotationOverlay } from './ui/AnnotationOverlay'

// Current exercise state — replaced on exercise switch
let animRoot: THREE.Object3D | null = null
let animationController: AnimationController | null = null

/**
 * Load an exercise by ID: clean up old model/controller, set up new one.
 */
async function loadExercise(id: string): Promise<void> {
  // Clean up previous exercise
  if (animationController) {
    animationController.dispose()
    animationController = null
    setAnimationController(null)
  }
  if (animRoot) {
    scene.remove(animRoot)
    animRoot = null
  }

  const exercise = getExercise(id)
  let clip: THREE.AnimationClip
  let rig: MannequinRig | null = null

  if (exercise.modelPath) {
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
    rig = buildMannequin()
    scene.add(rig.root)
    animRoot = rig.root
    clip = exercise.buildAnimation(rig)
  }

  animationController = new AnimationController(animRoot)
  animationController.play(clip)
  animationController.setPaused(!appStore.getState().isPlaying)
  animationController.setSpeed(appStore.getState().playbackSpeed)
  setAnimationController(animationController)

  // Expose rig joints for annotation overlays (null for GLB models)
  setRigJoints(rig?.joints ?? null)

  // Highlight muscles on the mannequin (skip for GLB models)
  if (rig) {
    applyMuscleHighlights(rig, exercise)
  }
}

async function init() {
  // Mount renderer into center panel
  const centerPanel = document.getElementById('panel-center')!
  initRenderer(centerPanel)

  // OrbitControls
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.target.set(0, 0.9, 0)
  controls.enableDamping = true
  controls.dampingFactor = 0.1
  controls.minDistance = 1.5
  controls.maxDistance = 8
  controls.maxPolarAngle = Math.PI * 0.85
  controls.update()

  // Register controls for camera presets
  registerControls(controls, camera)

  // Load initial exercise
  const initialId = appStore.getState().selectedExerciseId
  await loadExercise(initialId)

  // Subscribe to playback state changes
  appStore.subscribe((state, prevState) => {
    if (!animationController) return
    if (state.isPlaying !== prevState.isPlaying) {
      animationController.setPaused(!state.isPlaying)
    }
    if (state.playbackSpeed !== prevState.playbackSpeed) {
      animationController.setSpeed(state.playbackSpeed)
    }
  })

  // Subscribe to exercise switching
  appStore.subscribe((state, prevState) => {
    if (state.selectedExerciseId !== prevState.selectedExerciseId) {
      loadExercise(state.selectedExerciseId)
    }
  })

  // Mount UI panels
  const exerciseList = document.getElementById('exercise-list')!
  mountExerciseSelector(exerciseList)

  const formGuide = document.getElementById('form-guide')!
  mountFormGuide(formGuide)

  mountPlaybackOverlay(centerPanel)
  mountAnnotationOverlay(centerPanel)

  // Start render loop
  const loop = createRenderLoop(renderer, scene, camera, () => {
    controls.update()
    if (animationController && !appStore.getState().isScrubbing) {
      animationController.update()
    }
  })
  loop.start()
}

init()
