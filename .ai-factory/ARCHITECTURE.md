# Архитектура: Модульная архитектура библиотеки

## Обзор

`motion.js` использует **Модульную архитектуру библиотеки**: фреймворк-нейтральный `core`-движок в центре и независимые фреймворк-биндинги вокруг него. Зависимости всегда направлены к `core` — биндинги зависят от core, но core никогда не зависит от Vue, React или других фреймворков.

Эта архитектура выбрана потому, что библиотека должна работать в любом окружении без лишних зависимостей. Core использует только нативные браузерные API (Web Animations API, `getBoundingClientRect`). Каждый биндинг — это тонкая обёртка над core, адаптированная под идиомы конкретного фреймворка.

## Обоснование выбора

- **Тип проекта:** TypeScript-библиотека для frontend (нет бэкенда, нет базы данных)
- **Стек:** TypeScript + Web Animations API + опциональный Vue 3 / React
- **Ключевой фактор:** Нулевые runtime-зависимости в core; фреймворк-биндинги — опциональные пакеты

## Структура папок

```
src/
├── core/                              # CORE — фреймворк-агностик (только Web APIs)
│   ├── index.ts                       # Публичный API core-модуля
│   └── src/
│       ├── index.ts                   # Реэкспорты
│       ├── base/
│       │   └── BaseAnimation.ts       # Абстрактный контракт: play() / reverse()
│       ├── animations/
│       │   ├── AnimationRunner.ts     # Оркестратор: параллельный запуск, clear()
│       │   └── CardMoveAnimation.ts   # FLIP-исполнитель через Web Animations API
│       ├── builders/
│       │   └── AnimationBuilder.ts    # Fluent builder — точка входа для пользователей
│       ├── calculators/
│       │   └── TrajectoryCalculator.ts # FLIP-расчёт: before() → calculate()
│       └── types/
│           ├── trajectory.ts          # Trajectory
│           ├── animation.ts           # CardMoveOptions, AnimationConstructor
│           ├── builder.ts             # BuilderConfig
│           └── index.ts               # Реэкспорт всех типов
│
├── vue/                               # BINDING — Vue 3 (зависит от core + vue)
│   ├── index.ts                       # Публичный API Vue-биндинга
│   ├── src/index.ts
│   └── composables/
│       └── useCardAnimation.ts        # Vue composable с реактивным isAnimating
│
└── react/                             # BINDING — React (зависит от core + react) [планируется]
    ├── index.ts
    └── hooks/
        └── useCardAnimation.ts        # React hook
```

## Правила зависимостей

```
         ┌─────────────────────────────┐
         │          CORE               │  только Web APIs: HTMLElement, Animation
         │   (нулевые внешние зависимости) │
         └─────────────┬───────────────┘
                       │ (core зависит от)
         ┌─────────────▼───────────────┐
         │       FRAMEWORK BINDINGS    │
         │  vue/ ── import from core   │
         │  react/ ── import from core │
         └─────────────────────────────┘
```

- ✅ `vue/` → `core/` — биндинг импортирует из core
- ✅ `react/` → `core/` — биндинг импортирует из core
- ✅ `builders/` → `animations/`, `calculators/` — внутри core
- ❌ `core/` → `vue/` — core НИКОГДА не импортирует из биндинга
- ❌ `core/` → `react/` — core НИКОГДА не импортирует из биндинга
- ❌ `vue/` → `react/` — биндинги не зависят друг от друга

## Взаимодействие модулей

**FLIP pipeline** (последовательность внутри core):
```
AnimationBuilder.snapshot(cards)     // TrajectoryCalculator.before() — First
// ↓ изменение DOM пользователем
AnimationBuilder.buildAnimation(cards)  // TrajectoryCalculator.calculate() — Last+Invert
    → AnimationRunner.add(CardMoveAnimation)
AnimationRunner.play()               // Web Animations API — Play
```

**Vue биндинг** оборачивает pipeline в реактивный composable:
```
useCardAnimation() → AnimationBuilder (внутри) → snapshot() / animateMove()
                  ↗                             ↘
             ref(isAnimating)              builder.buildAnimation().play()
```

## Ключевые принципы

1. **Core без фреймворков:** `src/core/` имеет нулевые runtime-зависимости. Допустимы только `HTMLElement`, `getBoundingClientRect`, `element.animate()`.
2. **Биндинги — тонкие обёртки:** Биндинги только оборачивают core-API в идиомы фреймворка (ref, hook). Никакой анимационной логики в биндинге.
3. **ESM-only, `.js` расширения:** Все импорты с явным `.js` расширением — требование TypeScript `verbatimModuleSyntax`.
4. **Fluent builder:** `AnimationBuilder` — единственная точка входа для конечных пользователей. Все параметры настраиваются через него.
5. **Нативные `#` private fields:** Используй `#field` вместо TypeScript `private` для инкапсуляции состояния классов.

## Примеры кода

### Добавление нового типа анимации

```typescript
// src/core/src/animations/CardFadeAnimation.ts
import { BaseAnimation } from '../base/BaseAnimation.js';

export class CardFadeAnimation extends BaseAnimation {
    readonly #element: HTMLElement;
    readonly #duration: number;
    #nativeAnimation: Animation | null = null;

    constructor(element: HTMLElement, duration = 300) {
        super();
        this.#element = element;
        this.#duration = duration;
    }

    override play(): Promise<void> {
        this.#nativeAnimation = this.#element.animate(
            [{ opacity: 0 }, { opacity: 1 }],
            { duration: this.#duration, fill: 'none' }
        );
        return this.#nativeAnimation.finished.then(() => undefined);
    }

    override reverse(): Promise<void> {
        // симметричная реверс-анимация
        this.#nativeAnimation = this.#element.animate(
            [{ opacity: 1 }, { opacity: 0 }],
            { duration: this.#duration, fill: 'none' }
        );
        return this.#nativeAnimation.finished.then(() => undefined);
    }
}
```

### React-биндинг (паттерн для src/react/hooks/useCardAnimation.ts)

```typescript
// src/react/hooks/useCardAnimation.ts
import { useRef, useState, useCallback } from 'react';
import { AnimationBuilder } from '../../core/src/index.js';  // ← зависит только от core
import type { CardMoveOptions } from '../../core/src/index.js';

export function useCardAnimation(options: CardMoveOptions = {}) {
    const builderRef = useRef(new AnimationBuilder());
    const [isAnimating, setIsAnimating] = useState(false);

    // Настраиваем builder через опции
    if (options.duration !== undefined) builderRef.current.withDuration(options.duration);
    if (options.easing !== undefined) builderRef.current.withEasing(options.easing);

    const snapshot = useCallback((cards: Iterable<HTMLElement>) => {
        builderRef.current.snapshot(cards);
    }, []);

    const animateMove = useCallback(async (cards: Iterable<HTMLElement>) => {
        setIsAnimating(true);
        try {
            await builderRef.current.buildAnimation(cards).play();
        } finally {
            setIsAnimating(false);
        }
    }, []);

    return { snapshot, animateMove, isAnimating };
}
```

### Правильный порядок импортов в биндинге

```typescript
// ✅ Правильно: биндинг импортирует из core
import { AnimationBuilder } from '../../core/src/index.js';
import type { CardMoveOptions } from '../../core/src/index.js';

// ❌ Неправильно: core не должен импортировать из биндинга
// В src/core/src/ НЕЛЬЗЯ:
import { ref } from 'vue';  // ← нарушение границы модуля
```

## Анти-паттерны

- ❌ **Импорт Vue/React в core:** Любой `import from 'vue'` или `import from 'react'` в `src/core/` нарушает архитектуру.
- ❌ **Анимационная логика в биндинге:** Расчёт траекторий, управление Web Animations API — это задачи core, не биндинга.
- ❌ **Биндинг зависит от другого биндинга:** `vue/` не должен импортировать из `react/` и наоборот.
- ❌ **Состояние в AnimationRunner:** `AnimationRunner` не должен хранить глобальное состояние. Создавай новый экземпляр через `builder.buildAnimation()` для каждой анимации.
- ❌ **Прямой вызов `CardMoveAnimation` из пользовательского кода:** Конечные пользователи работают только через `AnimationBuilder` или фреймворк-composable/hook.
