import * as THREE from 'three'

/**
 * AnimationController — wraps THREE.AnimationMixer with play/pause/speed controls.
 *
 * Usage:
 *   const controller = new AnimationController(rig.root)
 *   controller.play(clip)
 *   // In render loop:
 *   controller.update()
 */
export class AnimationController {
  private mixer: THREE.AnimationMixer
  private clock: THREE.Clock
  private currentAction: THREE.AnimationAction | null = null

  /**
   * @param root - The root Object3D of the animated hierarchy (e.g. mannequin pelvis).
   *               The AnimationMixer is created with this root.
   */
  constructor(root: THREE.Object3D) {
    this.mixer = new THREE.AnimationMixer(root)
    this.clock = new THREE.Clock()
  }

  /**
   * Stop any current action and play the given clip on LoopRepeat (infinite).
   *
   * @param clip - AnimationClip to play (build with buildClip / buildQuatTrack)
   */
  play(clip: THREE.AnimationClip): void {
    if (this.currentAction) {
      this.currentAction.stop()
    }
    this.currentAction = this.mixer.clipAction(clip)
    this.currentAction.setLoop(THREE.LoopRepeat, Infinity)
    this.currentAction.play()
  }

  /**
   * Advance the mixer by the elapsed frame delta.
   * Call this once per render frame (inside the render loop onTick).
   */
  update(): void {
    const delta = this.clock.getDelta()
    this.mixer.update(delta)
  }

  /**
   * Set playback speed (timeScale on the current action).
   * 1.0 = normal speed, 0.5 = half speed, 2.0 = double speed.
   *
   * @param speed - Time scale multiplier
   */
  setSpeed(speed: number): void {
    this.mixer.timeScale = speed
  }

  /**
   * Pause or resume playback.
   *
   * @param paused - true to pause, false to resume
   */
  setPaused(paused: boolean): void {
    if (this.currentAction) {
      this.currentAction.paused = paused
    }
  }

  /** Current playback time of the active action. */
  getTime(): number {
    return this.currentAction?.time ?? 0
  }

  /** Duration of the active clip. */
  getDuration(): number {
    return this.currentAction?.getClip().duration ?? 0
  }

  /** Seek to a specific time without advancing the clock. */
  setTime(t: number): void {
    if (this.currentAction) {
      this.currentAction.time = t
      this.mixer.update(0)
    }
  }

  /**
   * Clean up the mixer and clock for exercise switching.
   * Stops all actions, uncaches the root, and stops the clock.
   */
  dispose(): void {
    if (this.currentAction) {
      this.currentAction.stop()
      this.currentAction = null
    }
    this.mixer.stopAllAction()
    this.mixer.uncacheRoot(this.mixer.getRoot())
    this.clock.stop()
  }
}
