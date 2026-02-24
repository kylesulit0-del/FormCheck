import { exerciseRegistry } from '../exercises/registry'
import { appStore } from '../core/store'

/**
 * Mounts the exercise selector buttons into the left panel.
 * Highlights the active exercise and switches on click.
 */
export function mountExerciseSelector(container: HTMLElement): void {
  function render() {
    const { selectedExerciseId } = appStore.getState()
    container.innerHTML = ''

    for (const [id, exercise] of exerciseRegistry) {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.textContent = exercise.name
      btn.className =
        'w-full text-left px-3 py-2 text-sm transition-colors border-l-2 ' +
        (id === selectedExerciseId
          ? 'border-accent text-accent font-medium bg-accent/10'
          : 'border-transparent text-white/70 hover:text-white hover:bg-white/5')

      btn.addEventListener('click', () => {
        appStore.getState().setExercise(id)
      })

      container.appendChild(btn)
    }
  }

  render()
  appStore.subscribe(render)
}
