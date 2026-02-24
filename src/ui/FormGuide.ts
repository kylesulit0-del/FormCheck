import { appStore } from '../core/store'
import { getExercise } from '../exercises/registry'

/**
 * Mounts the form guide panel showing exercise details:
 * name, difficulty, form steps, common mistakes, and muscles.
 */
export function mountFormGuide(container: HTMLElement): void {
  function render() {
    const { selectedExerciseId } = appStore.getState()
    const exercise = getExercise(selectedExerciseId)

    const difficultyColors: Record<string, string> = {
      beginner: 'text-green-400',
      intermediate: 'text-yellow-400',
      advanced: 'text-red-400',
    }

    container.innerHTML = `
      <h2 class="text-base font-semibold mb-1">${exercise.name}</h2>
      <span class="text-xs ${difficultyColors[exercise.difficulty] ?? 'text-white/50'} capitalize">${exercise.difficulty}</span>

      <section class="mt-5">
        <h3 class="text-xs font-medium text-white/50 uppercase tracking-wider mb-2">Form Steps</h3>
        <ol class="list-decimal list-inside space-y-1.5 text-sm text-white/80">
          ${exercise.formSteps.map((s) => `<li>${s}</li>`).join('')}
        </ol>
      </section>

      <section class="mt-5">
        <h3 class="text-xs font-medium text-white/50 uppercase tracking-wider mb-2">Common Mistakes</h3>
        <ul class="space-y-1.5 text-sm text-white/80">
          ${exercise.commonMistakes
            .map((m) => `<li class="flex gap-1.5"><span class="text-yellow-400 shrink-0">\u26A0</span><span>${m}</span></li>`)
            .join('')}
        </ul>
      </section>

      <section class="mt-5">
        <h3 class="text-xs font-medium text-white/50 uppercase tracking-wider mb-2">Muscles</h3>
        <div class="flex flex-wrap gap-1.5">
          ${exercise.primaryMuscles
            .map((m) => `<span class="px-2 py-0.5 rounded-full bg-accent/20 text-accent text-xs">${m}</span>`)
            .join('')}
          ${exercise.secondaryMuscles
            .map((m) => `<span class="px-2 py-0.5 rounded-full bg-white/10 text-white/60 text-xs">${m}</span>`)
            .join('')}
        </div>
      </section>
    `
  }

  render()
  appStore.subscribe(render)
}
