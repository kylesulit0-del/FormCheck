import './style.css'

console.log('FormCheck loaded')

const app = document.querySelector<HTMLDivElement>('#app')!

app.innerHTML = `
  <div class="flex items-center justify-center min-h-screen">
    <div class="bg-surface rounded-lg p-8 text-center">
      <h1 class="text-2xl font-bold text-mannequin mb-2">FormCheck</h1>
      <p class="text-white/60">3D exercise form demonstration</p>
    </div>
  </div>
`
