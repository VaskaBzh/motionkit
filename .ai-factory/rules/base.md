# Базовые правила проекта motion.js

> Автоопределённые соглашения из анализа кодовой базы. Редактируйте по необходимости.

## Соглашения об именовании

- Файлы классов: PascalCase (`AnimationRunner.ts`, `BaseAnimation.ts`)
- Файлы composables/hooks: camelCase с префиксом use (`useCardAnimation.ts`)
- Классы и интерфейсы: PascalCase (`AnimationBuilder`, `CardMoveOptions`)
- Переменные и функции: camelCase
- Приватные поля: нативные `#` private fields (не TypeScript `private`)

## Структура модулей

- `src/core/` — фреймворк-нейтральный движок анимаций
  - `src/core/src/base/` — абстрактные контракты (BaseAnimation)
  - `src/core/src/animations/` — конкретные реализации (CardMoveAnimation, AnimationRunner)
  - `src/core/src/builders/` — fluent builder (AnimationBuilder)
  - `src/core/src/calculators/` — расчёт траекторий (TrajectoryCalculator)
  - `src/core/src/types/` — общие интерфейсы (Trajectory, CardMoveOptions, BuilderConfig, AnimationConstructor)
- `src/vue/` — Vue 3 интеграция
  - `src/vue/composables/` — Vue composables

## Обработка ошибок

- Нет внутренней обработки ошибок в animation pipeline — ошибки DOM пробрасываются вызывающему коду
- Публичные API возвращают `Promise<void>` — реджект означает ошибку браузерного API

## Стиль кода

- ESM-only: импорты всегда с расширением `.js`
- Fluent builder паттерн: методы возвращают `this`
- Абстрактные классы для контрактов (не интерфейсы для исполнителей)
- `override` ключевое слово обязательно для переопределения методов

## Тестирование

- Фреймворк: Vitest
- Тесты рядом с источником или в `tests/` директории
