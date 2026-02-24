---
phase: 01-foundation
plan: 01
subsystem: infra
tags: [vite, typescript, three.js, tailwind, zustand, draco, gltf-transform]

# Dependency graph
requires: []
provides:
  - Vite 6 + vanilla TypeScript scaffold with three.js and zustand
  - Tailwind v4 CSS-first configuration with custom @theme tokens
  - Draco decoder files in public/draco/ for GLB decompression at runtime
  - Programmatic barbell.glb (4.96 KB, Draco-compressed) in public/models/
  - GLB compression pipeline via gltf-transform (scripts/compress-glb.sh)
  - Barbell generator script (scripts/generate-barbell.ts) using @gltf-transform/core
affects: [02-mannequin, 03-animation, 04-exercises, 05-polish]

# Tech tracking
tech-stack:
  added:
    - vite@6.4.1
    - three@0.172.0
    - zustand@5.0.3
    - tailwindcss@4.0.6
    - "@tailwindcss/vite@4.0.6"
    - "@gltf-transform/core@4.3.0"
    - "@gltf-transform/cli@4.3.0"
    - "@gltf-transform/functions@4.3.0"
    - typescript@5.7.3
  patterns:
    - "CSS-first Tailwind v4: @import 'tailwindcss' + @theme block, no tailwind.config.js"
    - "Draco prepare script: fs.cpSync recursive from node_modules/three draco libs"
    - "GLB generation: @gltf-transform/core Document/NodeIO for Node.js compatibility"
    - "Asset pipeline: generate-barbell.ts -> compress-glb.sh -> public/models/"

key-files:
  created:
    - package.json
    - tsconfig.json
    - vite.config.ts
    - index.html
    - src/main.ts
    - src/style.css
    - src/vite-env.d.ts
    - scripts/compress-glb.sh
    - scripts/generate-barbell.ts
    - public/models/barbell.glb
    - public/draco/ (Draco decoder WASM/JS files)
  modified: []

key-decisions:
  - "Use @gltf-transform/core for programmatic GLB generation (not Three.js GLTFExporter) — Node.js compatible, no DOM dependency"
  - "fs.cpSync(recursive:true) for Draco decoder copy — handles gltf/ subdirectory that fs.copyFileSync fails on"
  - "Barbell geometry along X-axis: center bar 1.8m, plates +-0.82m, collars +-0.60m from origin"
  - "Tailwind v4 CSS-first: @theme block in style.css with oklch color tokens for bg, surface, mannequin, accent"

patterns-established:
  - "GLB pipeline: generate (tsx script) -> compress (gltf-transform draco) -> public/models/"
  - "Draco decoder always in public/draco/ (including gltf/ subdirectory for GLTFLoader compatibility)"
  - "Theme tokens via Tailwind @theme block using oklch: bg=dark, surface=panel, mannequin=light gray"

requirements-completed: [TECH-03, TECH-04]

# Metrics
duration: 3min
completed: 2026-02-24
---

# Phase 1 Plan 01: Foundation Scaffold Summary

**Vite 6 + TypeScript + Three.js + Tailwind v4 project with working build, Draco decoder pipeline, and a programmatically-generated Draco-compressed barbell.glb (4.96 KB)**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-24T01:51:39Z
- **Completed:** 2026-02-24T01:54:59Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments
- Scaffolded Vite 6 vanilla-TS project with three.js, zustand, and Tailwind v4 — `npm run build` produces clean dist/ in 157ms
- Installed and configured @tailwindcss/vite plugin with CSS-first setup; custom @theme tokens (oklch) for bg, surface, mannequin, accent colors
- Copied Draco decoder files (including gltf/ subdirectory) to public/draco/ via `npm run prepare`
- Created programmatic barbell geometry using @gltf-transform/core: bar + 2 plates + 2 collars along X-axis
- Compressed barbell-raw.glb (11.84 KB) to barbell.glb (4.96 KB) with KHR_draco_mesh_compression edgebreaker — 58% reduction

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold Vite project with all dependencies and configuration** - `7cb6fd0` (feat)
2. **Task 2: Create Draco asset pipeline and generate compressed ghost barbell GLB** - `170a4d4` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified
- `package.json` - Project manifest: three, zustand, vite, tailwindcss, @gltf-transform deps; prepare + compress-glb scripts
- `tsconfig.json` - ES2022 target, bundler resolution, strict mode, noEmit
- `vite.config.ts` - Vite config with @tailwindcss/vite plugin
- `index.html` - Entry point with #app div, body class bg-bg, script module pointing to src/main.ts
- `src/main.ts` - App entry: imports style.css, logs "FormCheck loaded", renders placeholder in #app
- `src/style.css` - Tailwind v4: `@import "tailwindcss"` + `@theme` block with oklch color tokens
- `src/vite-env.d.ts` - Vite client types reference
- `public/draco/` - Draco decoder WASM/JS files (draco_decoder.wasm, draco_wasm_wrapper.js, gltf/ subdirectory)
- `public/models/barbell.glb` - Draco-compressed barbell (4.96 KB, KHR_draco_mesh_compression)
- `scripts/compress-glb.sh` - Shell script for repeatable Draco compression of any GLB
- `scripts/generate-barbell.ts` - Programmatic barbell generator using @gltf-transform/core

## Decisions Made
- Used `@gltf-transform/core` for GLB generation instead of Three.js GLTFExporter: NodeIO works natively in Node.js without DOM; GLTFExporter requires browser/DOM context
- Used `fs.cpSync(src, dest, {recursive: true})` in the prepare script: the Three.js draco directory contains a `gltf/` subdirectory that `fs.copyFileSync` cannot traverse, causing EPERM errors
- Barbell geometry uses cylinder primitives: center bar 1.8m long at 0.025m radius; plates at ±0.82m with 0.225m radius; collars at ±0.60m with 0.032m radius; all rotated to lie along X-axis

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Draco decoder copy failing on Windows due to subdirectory**
- **Found during:** Task 1 (npm install triggering prepare script)
- **Issue:** `fs.copyFileSync` cannot copy directories; the draco folder contains a `gltf/` subdirectory causing `EPERM: operation not permitted` on Windows
- **Fix:** Replaced `fs.readdirSync().forEach(copyFileSync)` with `fs.cpSync(src, dest, {recursive: true})` which handles nested directories
- **Files modified:** package.json (prepare script inline one-liner)
- **Verification:** `npm run prepare` completes successfully; `ls public/draco/gltf/` shows draco decoder files
- **Committed in:** 7cb6fd0 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug)
**Impact on plan:** Essential fix for Windows compatibility. The gltf/ subdirectory files are needed by Three.js GLTFLoader when loading Draco-compressed GLBs.

## Issues Encountered
- Windows `fs.cpSync` EPERM on directory: resolved by switching to recursive copy (see deviations above)

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Build system working: `npm run dev`, `npm run build`, `npm run preview` all functional
- Draco pipeline working: generate-barbell.ts + compress-glb.sh verified end-to-end
- Foundation ready for Phase 1 Plan 02: mannequin model generation
- No blockers

---
*Phase: 01-foundation*
*Completed: 2026-02-24*

## Self-Check: PASSED

All files verified present. Both task commits (7cb6fd0, 170a4d4) confirmed in git log.
