[← Начало работы](getting-started.md) · [Back to README](../README.md) · [API Reference →](api.md)

# Angular интеграция

`CardAnimationService` — Angular-сервис для FLIP-анимации карточек. Работает с Angular Signals и standalone-компонентами.

## Установка

```bash
npm install @motionlab/motionkit
```

**Peer dependency:** `@angular/core ^17.0.0`

---

## Быстрый старт

```typescript
import { Component, ElementRef, Injector, afterNextRender, inject, signal, viewChildren } from '@angular/core';
import { CardAnimationService } from '@motionlab/motionkit/angular';

@Component({
  selector: 'app-card-list',
  standalone: true,
  providers: [CardAnimationService],       // 1. Подключить сервис к компоненту
  template: `
    <button [disabled]="anim.isAnimating()" (click)="shuffle()">Перемешать</button>

    @for (card of cards(); track card.id) {
      <div class="card" #cardEl>{{ card.title }}</div>
    }
  `,
})
export class CardListComponent {
  protected readonly anim = inject(CardAnimationService);
  readonly #injector = inject(Injector);
  readonly cards = signal([
    { id: 1, title: 'Карточка A' },
    { id: 2, title: 'Карточка B' },
    { id: 3, title: 'Карточка C' },
  ]);
  readonly cardEls = viewChildren<ElementRef<HTMLElement>>('cardEl');

  async shuffle() {
    this.anim.snapshot(this.cardEls().map(r => r.nativeElement));  // 2. Снимок «до»
    this.cards.update(arr => shuffleArr(arr));                     // 3. Меняем данные
    await new Promise<void>(resolve =>                             // 4. Ждём render
      afterNextRender({ read: resolve }, { injector: this.#injector }),
    );
    await this.anim.animateMove(this.cardEls().map(r => r.nativeElement)); // 5. Анимируем
  }
}
```

> **Важно:** `providers: [CardAnimationService]` в декораторе компонента обязателен.
> Это даёт каждому экземпляру компонента независимый сервис — аналогично `useCardAnimation()` в Vue/React.

---

## API: два метода

### `snapshot(cards)`

```typescript
snapshot(cards: Iterable<HTMLElement>): void
```

Делает снимок позиций карточек **до** изменения DOM (шаг **First** FLIP-цикла).

Вызывай непосредственно перед изменением данных.

---

### `animateMove(cards)`

```typescript
animateMove(cards: Iterable<HTMLElement>): Promise<void>
```

Запускает FLIP-анимацию **после** изменения DOM (шаги **Last → Invert → Play**).

Вызывай после того, как Angular пересчитал DOM. В zoneless-приложениях для этого используй [`afterNextRender`](https://angular.dev/api/core/afterNextRender):

```typescript
await new Promise<void>(resolve =>
  afterNextRender({ read: resolve }, { injector: this.injector }),
);
await this.anim.animateMove(elements);
```

---

### `configure(options)`

```typescript
configure(options: {
  duration?: number;  // мс, по умолчанию 300
  easing?: string;    // CSS-функция, по умолчанию 'ease'
  stagger?: number;   // задержка между карточками в мс, по умолчанию 0
}): void
```

Применяет параметры анимации. Вызывай в любой момент — настройки применяются к следующей анимации.

---

### `isAnimating` Signal

```typescript
readonly isAnimating: Signal<boolean>
```

Angular Signal — `true` пока идёт анимация. Используй в шаблоне для блокировки кнопок:

```html
<button [disabled]="anim.isAnimating()">
  {{ anim.isAnimating() ? 'Анимация…' : 'Перемешать' }}
</button>
```

---

## Полный пример

```typescript
import { Component, ElementRef, Injector, afterNextRender, inject, signal, viewChildren } from '@angular/core';
import { CardAnimationService } from '@motionlab/motionkit/angular';

@Component({
  selector: 'app-shuffle-demo',
  standalone: true,
  providers: [CardAnimationService],
  template: `
    <label>
      Duration: {{ duration() }}ms
      <input type="range" min="100" max="2000" step="50"
        [value]="duration()" (input)="duration.set(+$any($event.target).value)" />
    </label>

    <label>
      Stagger: {{ stagger() }}ms
      <input type="range" min="0" max="200" step="10"
        [value]="stagger()" (input)="stagger.set(+$any($event.target).value)" />
    </label>

    <button [disabled]="anim.isAnimating()" (click)="shuffle()">
      {{ anim.isAnimating() ? 'Анимация…' : 'Перемешать' }}
    </button>

    @for (card of cards(); track card.id) {
      <div class="card" #cardEl [style.background]="card.color">
        {{ card.title }}
      </div>
    }
  `,
})
export class ShuffleDemoComponent {
  protected readonly anim = inject(CardAnimationService);
  readonly #injector = inject(Injector);
  readonly cards = signal([...INITIAL_CARDS]);
  readonly duration = signal(500);
  readonly stagger = signal(30);
  readonly cardEls = viewChildren<ElementRef<HTMLElement>>('cardEl');

  async shuffle() {
    this.anim.configure({
      duration: this.duration(),
      stagger: this.stagger(),
    });

    this.anim.snapshot(this.cardEls().map(r => r.nativeElement));
    this.cards.update(arr => shuffleArr(arr));
    await new Promise<void>(resolve =>
      afterNextRender({ read: resolve }, { injector: this.#injector }),
    );
    await this.anim.animateMove(this.cardEls().map(r => r.nativeElement));
  }
}
```

---

## Почему нужен `afterNextRender`?

Angular в zoneless-режиме не синхронно обновляет DOM после изменения сигнала. `afterNextRender` гарантирует, что к моменту вызова `animateMove()` DOM полностью пересчитан и карточки занимают новые позиции.

`Injector` нужен, чтобы `afterNextRender` знал контекст компонента. Получай его через `inject(Injector)` в конструкторе или поле класса.

---

## See Also

- [API Reference](api.md) — полная документация `CardAnimationService`
- [Начало работы](getting-started.md) — установка и базовые примеры
- [Vue интеграция](vue.md) — `useCardAnimation` composable
- [React интеграция](react.md) — `useCardAnimation` hook
