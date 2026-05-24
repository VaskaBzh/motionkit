# @motionlab/motionkit

> Плавные FLIP-анимации карточек на TypeScript. Нулевые зависимости.

TypeScript-библиотека для анимации перестановки HTML-карточек на основе техники **FLIP** (First → Last → Invert → Play). Использует нативный Web Animations API — никаких runtime-зависимостей.

## Быстрый старт

```bash
npm install @motionlab/motionkit
```

```typescript
import { AnimationBuilder } from '@motionlab/motionkit/core';

const builder = new AnimationBuilder()
  .withDuration(350)
  .withEasing('cubic-bezier(0.4, 0, 0.2, 1)')
  .withStagger(30);

// До изменения DOM
builder.snapshot(cards);

// Изменяем порядок элементов...
reorderCards();

// После изменения DOM — запускаем анимацию
await builder.buildAnimation(cards).play();
```

## Ключевые возможности

- **FLIP-техника** — плавное движение карточек без layout thrashing
- **Web Animations API** — нативный браузерный API, никаких зависимостей
- **Fluent builder** — читаемый DSL для настройки анимаций
- **Stagger** — волновой эффект задержек между карточками
- **Plugin API** — подключи свой класс анимации через `.use()`
- **Vue 3** — готовый composable `useCardAnimation`
- **React** — хук `useCardAnimation` с поддержкой FLIP-паттерна
- **TypeScript** — полная типизация из коробки

## Vue 3

```typescript
import { useCardAnimation } from '@motionlab/motionkit/vue';

const { snapshot, animateMove, isAnimating } = useCardAnimation({
  duration: 350,
  stagger: 30,
});

async function onReorder() {
  snapshot(cards.value);
  reorderCards();
  await nextTick();
  await animateMove(cards.value);
}
```

## React

```tsx
import { useRef, useState, useEffect } from 'react';
import { useCardAnimation } from '@motionlab/motionkit/react';

function MyList() {
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const shouldAnimate = useRef(false);
  const [cards, setCards] = useState([...]);
  const { snapshot, animateMove, isAnimating } = useCardAnimation({ duration: 400, stagger: 30 });

  useEffect(() => {
    if (!shouldAnimate.current) return;
    shouldAnimate.current = false;
    void animateMove(cardRefs.current.filter(Boolean));
  }, [cards, animateMove]);

  const shuffle = () => {
    snapshot(cardRefs.current.filter(Boolean));
    shouldAnimate.current = true;
    setCards(prev => shuffleArray([...prev]));
  };
}
```

Открыть React demo: [react.html](react.html)

---

## Документация

| Раздел | Описание |
|--------|---------|
| [Начало работы](docs/getting-started.md) | Установка, настройка, первые шаги |
| [API Reference](docs/api.md) | Классы, методы, типы |
| [Архитектура](docs/architecture.md) | Структура проекта, расширение библиотеки |
| [Contributing](docs/contributing.md) | Как участвовать в разработке |

## Лицензия

MIT
