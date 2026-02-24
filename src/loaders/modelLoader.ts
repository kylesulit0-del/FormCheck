import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'

export interface LoadedModel {
  scene: THREE.Group
  clips: THREE.AnimationClip[]
}

const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/gltf/')

const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

/**
 * Load a GLB file and return its scene graph + embedded animation clips.
 *
 * @param path - URL path to the GLB file (e.g. '/models/exercises/squat.glb')
 * @returns The loaded scene group and all animation clips from the file
 */
export function loadExerciseModel(path: string): Promise<LoadedModel> {
  return new Promise((resolve, reject) => {
    gltfLoader.load(
      path,
      (gltf) => {
        resolve({ scene: gltf.scene, clips: gltf.animations })
      },
      undefined,
      (error) => {
        reject(new Error(`Failed to load model at ${path}: ${error}`))
      },
    )
  })
}
