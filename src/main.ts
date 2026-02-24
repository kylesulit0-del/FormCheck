import './style.css'
import { scene, camera, renderer } from './core/renderer'
import { createRenderLoop } from './core/loop'
import { buildMannequin } from './mannequin/MannequinBuilder'

// Build and add the mannequin to the scene
const rig = buildMannequin()
scene.add(rig.root)

// Start render loop (static display — animation added in Plan 03)
const loop = createRenderLoop(renderer, scene, camera)
loop.start()
