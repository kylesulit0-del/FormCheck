import type { AnimationController } from '../animation/AnimationController'

let _controller: AnimationController | null = null

export function setAnimationController(c: AnimationController | null): void {
  _controller = c
}

export function getAnimationController(): AnimationController | null {
  return _controller
}
