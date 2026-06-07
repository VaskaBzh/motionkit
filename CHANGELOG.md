# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Angular integration: `CardAnimationService` with Signal-based `isAnimating` state and `afterNextRender` lifecycle support (PR #5)
- High-level `animate(getElements, updateState)` method that handles the full FLIP cycle automatically
- Angular demo app with Shuffle and Dynamic tabs (`demo-angular/`)
- `docs/angular.md` — full Angular integration guide
- `./angular` package export entry point (`@motionlab/motionkit/angular`)

---

## [0.1.1] - 2026-05-31

### Added
- React hook `useCardAnimation` with FLIP pattern via `useRef` + `useEffect`
- React integration documentation (`docs/react.md`)
- Vue 3 integration documentation (`docs/vue.md`)
- JSDoc with usage example on `useCardAnimation` hook (React)
- MIT License (`LICENSE`)
- This changelog (`CHANGELOG.md`)
- GitFlow branch naming convention and project rules

### Changed
- README translated to English and restructured: user docs table now shows only end-user sections; Architecture and Contributing moved to a separate For Contributors section
- All documentation (`docs/`) translated to English
- All Russian code comments in `src/` translated to English
- Package metadata: added `keywords` and `repository` fields to `package.json`

---

## [0.1.0] - 2026-05-18

### Added
- Core FLIP animation engine:
  - `AnimationBuilder` — fluent builder, main entry point
  - `AnimationRunner` — parallel animation orchestrator
  - `TrajectoryCalculator` — FLIP position delta calculation (First/Last/Invert steps)
  - `CardMoveAnimation` — Web Animations API executor with `play()` and `reverse()`
- Stagger animation: configurable per-card delay for wave effect
- Plugin API: plug in a custom animation class via `.use(AnimationConstructor)`
- Vue 3 composable `useCardAnimation` with reactive `Ref<boolean>` `isAnimating` flag
- Full TypeScript typings exported from all entry points
- Interactive demo stand
- ESLint with TypeScript-aware `.ts` import enforcement
- CI pipeline (GitHub Actions)

### Fixed
- `CardMoveAnimation`: use `fill: 'backwards'` to prevent visual flicker at animation start

### Changed
- Package renamed from `motion.js` to `@motionlab/motionkit`
- `BaseAnimation` moved to `src/core/src/base/`
- Types split into `animation.ts`, `trajectory.ts`, `builder.ts` for clarity
- All imports use `.ts` extension (ESM-only)
