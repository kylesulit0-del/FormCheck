# Feature Research

**Domain:** 3D exercise form guide / fitness visualization website
**Researched:** 2026-02-23
**Confidence:** MEDIUM (competitor feature sets verified via direct site review and multiple search sources; some user expectation claims are inferred from UX research patterns rather than FormCheck-specific user studies)

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| 3D figure performing exercise on loop | Core product promise — without this, there is no product | HIGH | The mannequin must animate continuously without user initiation. Still frame is not acceptable. Looping is the baseline. |
| Orbit controls (rotate + zoom) | Every 3D viewer in this space offers it — users assume they can spin the model | MEDIUM | Three.js OrbitControls handles this. Click-drag to rotate, scroll to zoom. |
| Exercise list / selector panel | Users need to navigate between exercises | LOW | Static list is fine for v1 with 5 exercises. Filter/search only matters when library is large. |
| Step-by-step form instructions | Text alongside the 3D view — users expect written cues, not just animation | LOW | Content must be accurate and sourced. Every competitor (MuscleWiki, Muscle & Motion, iMuscle 2, Fitbod) provides written instructions. |
| "Common mistakes" / what not to do | Users come specifically to learn correct form — knowing what to avoid is core to that | LOW | Muscle & Motion and MuscleWiki both include this as standard. It's expected, not novel. |
| Play / pause control | Animation control is expected the moment a user sees a looping animation | LOW | Simple toggle button. |
| Playback speed control | Slow-motion is how users study form — this appears across Muscle & Motion, Onform, and AI form analysis apps | MEDIUM | Need to expose at least slow / normal / fast. Controlled via Three.js animation mixer timeScale. |
| Camera angle presets | Front, side, and back views — these are how coaches and athletes analyze form | MEDIUM | Preset buttons that programmatically set camera position. Muscle & Motion explicitly advertises "multi-angle views." |
| Dark-themed layout | Fitness/visualization products universally use dark UI — lighter backgrounds feel clinical or out of place | LOW | Design decision already made in PROJECT.md. |
| Mobile-responsive layout | Users will arrive on phones. A broken mobile layout is an instant bounce. | MEDIUM | Responsive layout but not mobile-native. Three.js viewport scaling needs attention. |
| Free, no-account access | MuscleWiki's most praised attribute is "100% free, no registration required." Users bail when gated. | LOW | Already scoped as static site, no auth. This is a competitive advantage to preserve. |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Programmatic / procedural 3D animation (not pre-made video or mocap) | Most competitors use HD video (Fitbod, MuscleWiki, MuscleAndStrength) or expensive licensed 3D assets (Muscle & Motion, gym-animations.com). A fully procedural animation pipeline is technically novel and enables limitless extensibility without per-exercise licensing costs. | HIGH | The core technical bet of this project. If it works, adding a new exercise is a data change, not an asset production job. |
| Single-page unified layout (selector + 3D viewer + instructions simultaneously) | Competitors either show video then text below, or require navigation. FormCheck puts all three panels on screen at once — no scrolling or navigation to see instructions while watching the animation. | MEDIUM | The PROJECT.md layout is already differentiated vs. Fitbod (app-first), MuscleWiki (video + scroll), Muscle & Motion (subscription app). |
| Primary and secondary muscle color highlighting on the 3D model | Muscle & Motion and iMuscle 2 offer this — MuscleWiki does not. It transforms a "watch the animation" experience into "understand which muscles fire and why." | HIGH | Requires either an anatomically mapped mesh with per-material color control, or a transparent overlay. Complex but high value. |
| Annotation overlays during animation | On-model labels or arrows that appear during key phases of the movement (e.g., "keep chest up" at the bottom of a squat) | HIGH | No competitor does this on the model itself. Would distinguish FormCheck as genuinely instructional, not just visual. Defer to v2 unless easy. |
| Frame-by-frame scrubbing / timeline slider | Lets users stop at any point in the movement — e.g., pause at hip hinge to study position | MEDIUM | Muscle & Motion doesn't expose this. iMuscle 2 doesn't mention it. Genuinely underserved. Three.js animation mixer supports scrubbing. |
| Shareable deep-link URLs per exercise | User can link directly to "squat" and land with that exercise pre-loaded | LOW | Static site + URL hash or query param. Enables social sharing, which drives organic growth. No competitor deep-links exercise views. |
| Clearly documented dev workflow for adding exercises | Not user-facing, but enables rapid content expansion without a CMS. Translates to faster content velocity vs. competitors who manage assets manually or through paywalled editors. | LOW | Data-driven exercise config (JSON or similar). New exercise = new config entry + animation data. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| User accounts and saved progress | Users of workout apps expect to track sessions | Auth adds backend, sessions, data storage, privacy compliance (GDPR/CCPA), and maintenance burden that overwhelms a static form guide site. FormCheck is a reference tool, not a training logger. | Keep it stateless. If tracking is wanted later, link out to Fitbod/MuscleWiki for that purpose. |
| AI real-time form analysis via camera | Apps like AiKYNETIX, CueForm AI, FormCheck AI do this — users might ask for it | Requires server-side vision processing or a heavy client-side ML model (MediaPipe). Incompatible with static hosting. Changes the product from "reference guide" to "personal trainer." Enormous scope jump. | The 3D demonstration IS the form guide. Users self-correct by comparing their own movement to the reference. |
| Full exercise library (500+ exercises at launch) | MuscleWiki has 2000+, users expect breadth | Content accuracy degrades fast at scale. Animation pipeline must be proven first. 5 foundational exercises done well beats 50 done poorly. | Start with 5, prove the pipeline, then scale. Make exercise addition trivially easy via dev workflow so the library can grow. |
| Video content alongside 3D models | Many competitors use HD video — familiar to users | Video files are large, require CDN costs, need re-shooting when content updates, and create a two-track maintenance problem. The 3D model IS the visualization — mixing modalities creates confusion about which to trust. | Commit fully to 3D. If users want video, they can find MuscleWiki or Fitbod. |
| CMS / admin panel for exercise management | Non-technical contributors might want to add exercises | CMS adds backend, auth, database, and ongoing infrastructure cost for a tool that only needs a dev workflow | Simple JSON config + documented dev workflow. Exercise authoring remains a dev task in v1. |
| Social features (sharing, comments, community) | Users on fitness platforms engage with each other | Social features require moderation, accounts, notifications, and ongoing community management — none of which is the product's purpose. | The shareable deep-link URL covers the minimum social use case (link to an exercise). |
| Anatomically detailed muscle mesh (visible tissue layers) | iMuscle 2's "scalpel tool to reveal deeper muscles" is compelling | Deep anatomy visualization targets medical/clinical users, not the gym-going audience FormCheck serves. Adds significant 3D asset complexity. | Show muscle highlighting via color on the existing mannequin. The mannequin style (simple humanoid) is intentional — approachable, not clinical. |

---

## Feature Dependencies

```
[Exercise Selector]
    └──requires──> [Exercise Data Config] (JSON or similar)
                       └──required by──> [3D Animation Player]
                       └──required by──> [Form Instructions Panel]
                       └──required by──> [Common Mistakes Section]

[3D Animation Player]
    └──requires──> [Orbit Controls]
    └──requires──> [Play/Pause Control]
    └──requires──> [Playback Speed Control]
    └──requires──> [Camera Angle Presets]

[Playback Speed Control] ──enhances──> [3D Animation Player]
    (speed control modifies animation mixer timeScale — requires animation player to exist first)

[Camera Angle Presets] ──enhances──> [Orbit Controls]
    (presets snap the camera to fixed positions — requires orbit controls to be set up first)

[Muscle Highlighting] ──requires──> [3D Animation Player]
    (highlighting is driven by which exercise is selected and which phase the animation is in)

[Shareable Deep Links] ──requires──> [Exercise Selector]
    (URL state reflects selected exercise — selector must exist and be URL-addressable)

[Frame Scrubbing / Timeline] ──requires──> [Play/Pause Control]
    (timeline is an extension of play/pause — needs the animation control layer first)

[Annotation Overlays] ──requires──> [3D Animation Player] + [Exercise Data Config]
    (annotations are phase-keyed to animation frames — needs both the player and structured data)
```

### Dependency Notes

- **Exercise Data Config is the foundation:** All features that display exercise-specific content (form instructions, mistakes, animation, camera presets) pull from the same config entry. The config schema must be designed to support all planned features, even if some are v2.
- **Orbit Controls before Presets:** Camera presets are just programmatic orbit control positions. Don't build presets without orbit controls already working.
- **Muscle Highlighting complexity:** This feature requires either a segmented mesh (per-muscle geometry) or a texture/material approach. The choice here affects the 3D model selection decision upstream. Flag for architecture research.
- **Frame Scrubbing conflicts with loop:** A continuously looping animation and a scrubbing timeline are conceptually compatible but require the loop to be pauseable and the animation to be addressable by time position. Plan for this in the animation state machine.

---

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate the concept.

- [ ] Exercise selector listing 5 foundational exercises (squat, bench press, pushup, deadlift, plank) — the minimum set to prove the concept across push/pull/hinge/squat/isometric patterns
- [ ] 3D humanoid figure animating each exercise on loop — without this, there is no product
- [ ] Orbit controls (rotate + zoom) — without this, the 3D model has no advantage over a video
- [ ] Play / pause — minimum animation control
- [ ] Playback speed control (slow / normal / fast) — how users study form; expected by anyone who has used slow-motion video analysis
- [ ] Camera angle presets (front / side / back) — study form from relevant angles without manual orbiting
- [ ] Step-by-step form instructions per exercise — text content alongside the viewer
- [ ] Common mistakes section per exercise — distinguishes FormCheck from a "watch pretty animation" toy
- [ ] Dark-themed single-page layout — all three panels (selector, viewer, instructions) visible simultaneously

### Add After Validation (v1.x)

Features to add once core is working and users are engaging.

- [ ] Primary / secondary muscle highlighting on the 3D model — add when the core viewer is stable; requires solving the segmented mesh or material approach
- [ ] Shareable deep-link URLs per exercise — add when there is evidence users want to share specific exercises (look for copy-paste of URLs in analytics)
- [ ] Frame-by-frame scrubbing / timeline slider — add when users explicitly request it (the speed control covers most of the use case at launch)
- [ ] Expanded exercise library (10-20 exercises) — triggered by: animation pipeline is proven and dev workflow is documented

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] Annotation overlays during animation — requires structured phase data in config and overlay rendering system; high complexity for uncertain value
- [ ] Muscle diagram / body map navigation (MuscleWiki-style clickable body) — useful when library exceeds ~30 exercises; not needed for 5-10
- [ ] Exercise filtering by muscle group, equipment type — needed when library is large enough to require navigation
- [ ] Complex sport-specific movements — explicitly out of scope per PROJECT.md until animation pipeline is proven

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| 3D animation on loop | HIGH | HIGH | P1 |
| Exercise selector | HIGH | LOW | P1 |
| Orbit controls | HIGH | LOW | P1 |
| Form instructions text | HIGH | LOW | P1 |
| Common mistakes content | HIGH | LOW | P1 |
| Play / pause | HIGH | LOW | P1 |
| Playback speed control | HIGH | LOW | P1 |
| Camera angle presets | HIGH | LOW | P1 |
| Dark-themed layout | MEDIUM | LOW | P1 |
| Muscle highlighting | HIGH | HIGH | P2 |
| Shareable deep links | MEDIUM | LOW | P2 |
| Frame scrubbing / timeline | MEDIUM | MEDIUM | P2 |
| Annotation overlays | HIGH | HIGH | P3 |
| Body map navigation | MEDIUM | MEDIUM | P3 |
| Exercise filter / search | MEDIUM | MEDIUM | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

---

## Competitor Feature Analysis

| Feature | MuscleWiki | Muscle & Motion | iMuscle 2 | Fitbod | FormCheck Approach |
|---------|------------|-----------------|-----------|--------|--------------------|
| 3D animated figure | No (video / GIF) | Yes (proprietary 3D) | Yes (proprietary 3D) | No (HD video) | Yes — core differentiator |
| Orbit / rotate model | No | Yes | Yes | No | Yes — table stakes for 3D |
| Playback speed control | No | Not confirmed | Not confirmed | No | Yes — differentiator vs. video-based competitors |
| Camera angle presets | No | Yes ("multi-angle views") | No | No | Yes — standard for 3D form tools |
| Muscle highlighting | No | Yes (color-coded primary/secondary) | Yes (primary/secondary) | No | Planned (v1.x) |
| Form instructions text | Yes | Yes | Yes | Yes | Yes — table stakes |
| Common mistakes content | Yes | Yes | Yes | No | Yes — table stakes |
| Free / no account | Yes | No (subscription) | No (paid app) | No (subscription) | Yes — competitive advantage |
| Exercise selector | Yes (body map) | Yes | Yes (search + filter) | Yes | Yes (simple list for v1) |
| Body map navigation | Yes | No | Yes (tap muscle) | No | Defer to v2+ |
| AI form analysis | No | No | No | No | Anti-feature — out of scope |
| Workout tracking | Yes | Yes | Yes | Yes | Anti-feature — out of scope |
| Shareable deep links | No | No | No | No | Planned (v1.x) — genuine gap |

---

## Sources

- MuscleWiki (https://musclewiki.com) — direct product review, feature inventory
- Muscle and Motion Strength Training App (https://www.muscleandmotion.com/strength-training-app/) — direct product review
- Muscle and Motion "3D Animation in Fitness" (https://www.muscleandmotion.com/how-a-3d-workout-helps-enhance-strength-training/) — feature rationale and user value claims
- iMuscle 2 by 3D4Medical (https://3d4medical.com/apps/imuscle-2) — direct product review
- Fitbod exercise library (https://fitbod.me/about-fitbod-exercises/) — video-based competitor baseline
- Gym Animations (https://gym-animations.com) — 3D fitness animation supply-side research; confirms MP4 format, muscle highlight convention (red), and pre-made asset licensing model
- CueForm AI review article (https://cueform.ai/posts/5-best-apps-for-analyzing-weightlifting-form) — AI form analysis competitor landscape
- MuscleAndStrength exercise database (https://www.muscleandstrength.com/exercises) — video library UX baseline
- Stormotion fitness app UX research (https://stormotion.io/blog/fitness-app-ux/) — user expectations for fitness visualization UX patterns
- Perpet.io fitness app design best practices (https://perpet.io/blog/what-should-be-ui-ux-design-of-fitness-app/) — filter and content UX standards

---
*Feature research for: 3D exercise form guide website (FormCheck)*
*Researched: 2026-02-23*
