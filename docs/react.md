# React integration

`@motionlab/motionkit/react` предоставляет хук `useCardAnimation` — React-аналог Vue composable с идентичным FLIP-API.

## Установка

```bash
npm install @motionlab/motionkit react react-dom
```

## API

### `useCardAnimation(options?)`

```typescript
import { useCardAnimation } from '@motionlab/motionkit/react';

const { snapshot, animateMove, isAnimating } = useCardAnimation(options);
```

**Параметры `CardAnimationHookOptions`:**

| Параметр   | Тип      | По умолчанию | Описание                              |
|------------|----------|--------------|---------------------------------------|
| `duration` | `number` | `300`        | Длительность анимации в мс            |
| `easing`   | `string` | `'ease'`     | CSS-функция плавности                 |
| `stagger`  | `number` | `0`          | Задержка между соседними карточками   |
| `delay`    | `number` | `0`          | Начальная задержка                    |

**Возвращает `UseCardAnimationReturn`:**

| Поле          | Тип                                              | Описание                                 |
|---------------|--------------------------------------------------|------------------------------------------|
| `snapshot`    | `(cards: Iterable<HTMLElement>) => void`         | Запоминает позиции до изменения DOM      |
| `animateMove` | `(cards: Iterable<HTMLElement>) => Promise<void>`| Запускает FLIP-анимацию после DOM-смены  |
| `isAnimating` | `boolean`                                        | `true` пока идёт анимация                |

> Отличие от Vue: `isAnimating` — обычный `boolean` (не `Ref<boolean>`). React управляет ре-рендером через `useState` внутри хука.

## FLIP-паттерн в React

Ключевое отличие от Vue — React не имеет `nextTick`. Правильный паттерн: `snapshot` → `setState` → `useEffect` → `animateMove`.

```tsx
const cardRefs = useRef<(HTMLElement | null)[]>([]);
const shouldAnimate = useRef(false); // сигнал "нужна анимация после рендера"

const handleReorder = () => {
  // 1. Снимок позиций ПЕРЕД изменением состояния
  snapshot(cardRefs.current.filter((el): el is HTMLElement => el !== null));
  shouldAnimate.current = true;
  // 2. Изменяем состояние → React перерисует DOM
  setCards(prev => reorder(prev));
};

useEffect(() => {
  // 3. Запускаем анимацию ПОСЛЕ рендера
  if (!shouldAnimate.current) return;
  shouldAnimate.current = false;
  void animateMove(cardRefs.current.filter((el): el is HTMLElement => el !== null));
}, [cards, animateMove]);
```

Ref-массив для карточек заполняется через callback ref:

```tsx
{cards.map((card, i) => (
  <div key={card.id} ref={el => { cardRefs.current[i] = el; }}>
    {card.title}
  </div>
))}
```

## Пример: ShuffleDemo

Перемешивание 6 карточек с настройкой параметров:

```tsx
import { useState, useRef, useEffect } from 'react';
import { useCardAnimation } from '@motionlab/motionkit/react';

interface Card { id: number; title: string; color: string }

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function ShuffleDemo() {
  const [cards, setCards] = useState<Card[]>([
    { id: 1, title: 'A', color: '#ef4444' },
    { id: 2, title: 'B', color: '#f97316' },
    { id: 3, title: 'C', color: '#22c55e' },
  ]);

  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const shouldAnimate = useRef(false);
  const { snapshot, animateMove, isAnimating } = useCardAnimation({ duration: 500, stagger: 30 });

  useEffect(() => {
    if (!shouldAnimate.current) return;
    shouldAnimate.current = false;
    void animateMove(cardRefs.current.filter((el): el is HTMLElement => el !== null));
  }, [cards, animateMove]);

  const handleShuffle = () => {
    snapshot(cardRefs.current.filter((el): el is HTMLElement => el !== null));
    shouldAnimate.current = true;
    setCards(prev => shuffleArray(prev));
  };

  return (
    <>
      <button onClick={handleShuffle} disabled={isAnimating}>Перемешать</button>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {cards.map((card, i) => (
          <div
            key={card.id}
            ref={el => { cardRefs.current[i] = el; }}
            style={{ background: card.color, padding: 20, borderRadius: 12 }}
          >
            {card.title}
          </div>
        ))}
      </div>
    </>
  );
}
```

## Пример: DynamicDemo

Добавление и удаление карточек с анимацией смещения:

```tsx
export function DynamicDemo() {
  const [cards, setCards] = useState<Card[]>(initialCards);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const shouldAnimate = useRef(false);
  const { snapshot, animateMove } = useCardAnimation({ duration: 400, stagger: 25 });

  useEffect(() => {
    if (!shouldAnimate.current) return;
    shouldAnimate.current = false;
    void animateMove(cardRefs.current.filter((el): el is HTMLElement => el !== null));
  }, [cards, animateMove]);

  const trigger = (updater: (prev: Card[]) => Card[]) => {
    snapshot(cardRefs.current.filter((el): el is HTMLElement => el !== null));
    shouldAnimate.current = true;
    setCards(updater);
  };

  return (
    <>
      <button onClick={() => trigger(prev => [newCard(), ...prev])}>+ в начало</button>
      <button onClick={() => trigger(prev => [...prev, newCard()])}>+ в конец</button>
      <button onClick={() => trigger(prev => prev.slice(1))}>− первую</button>
      {/* ... */}
    </>
  );
}
```

## Отличия от Vue

| Аспект | Vue 3 | React |
|---|---|---|
| `isAnimating` | `Ref<boolean>` (`.value`) | `boolean` (напрямую) |
| После DOM-изменения | `await nextTick()` | `useEffect([cards])` |
| Сигнал анимации | неявный через порядок вызовов | `shouldAnimate` ref |
| Стабильность builder | создаётся один раз в setup | `useRef(new AnimationBuilder())` |
