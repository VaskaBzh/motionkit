[← Architecture](architecture.md) · [Back to README](../README.md)

# Contributing

## Development Setup

### Requirements

- Node.js 22+
- npm 10+

### Install Dependencies

```bash
npm install
```

### Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite dev server (sandbox/demo) |
| `npm run build` | Build the library into `dist/` |
| `npm run preview` | Preview the built output |
| `npm run lint` | ESLint check on `src/` |
| `npm run typecheck` | TypeScript check without emit (`tsc --noEmit`) |
| `npm test` | Run all unit tests (Vitest) |
| `npm run test:coverage` | Run tests with coverage report |

## Project Structure

Before making changes, read the [Architecture](architecture.md) guide.

Key rules:
- `src/core/` — Web APIs only, no framework imports
- Imports with `.ts` extension (not `.js`)
- Directory imports — folder path only (`'../types'`, not `'../types/index.ts'`)
- Native `#` private fields (not TypeScript `private`)
- `override` keyword when overriding methods

## Adding Features

1. **New animation type** → create in `src/core/src/animations/`, extend `BaseAnimation` from `base/`
2. **New framework binding** → create `src/<framework>/`, import only from `core/`
3. **Builder API change** → update `AnimationBuilder.ts` and types in `types/`

## TypeScript

The project uses strict TypeScript mode:

```json
"strict": true,
"exactOptionalPropertyTypes": true,
"noImplicitOverride": true,
"noUnusedLocals": true,
"noUnusedParameters": true
```

## Code Checks

```bash
# Type check
npm run typecheck

# Lint
npm run lint
```

## Testing

The project uses [Vitest](https://vitest.dev/). Tests live next to their source files:

```
src/
├── core/src/animations/__tests__/AnimationRunner.test.ts
├── core/src/builders/__tests__/AnimationBuilder.test.ts
├── core/src/calculators/__tests__/TrajectoryCalculator.test.ts
└── vue/composables/__tests__/useCardAnimation.test.ts
```

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode during development
npm run test:watch
```

## CHANGELOG

Every PR to `develop` or `master` must update `CHANGELOG.md` under `[Unreleased]`.

## See Also

- [Architecture](architecture.md) — patterns and dependency rules
- [API Reference](api.md) — public API documentation
