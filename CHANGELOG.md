# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Angular integration: `CardAnimationService` with Signal-based `isAnimating` state and `afterNextRender` lifecycle support
- Angular demo app (Shuffle + Dynamic tabs)
- `docs/angular.md` — full Angular integration guide
- `./angular` package export entry point

## [0.1.0] - 2026-01-01

### Added
- Core FLIP animation engine (`AnimationBuilder`, `AnimationRunner`, `TrajectoryCalculator`, `CardMoveAnimation`)
- Web Animations API executor with `play()` and `reverse()` support
- Stagger animation: configurable per-card delay for wave effect
- Plugin API: custom animation class via `.use()`
- Vue 3 composable `useCardAnimation` with reactive `isAnimating` flag
- React hook `useCardAnimation` with FLIP pattern via `useRef` + `useEffect`
- Full TypeScript typings
- Zero runtime dependencies
