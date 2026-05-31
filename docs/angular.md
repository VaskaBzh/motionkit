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
import { Component, ElementRef, signal, viewChildren } from '@angular/core';
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
  readonly cards = signal([
    { id: 1, title: 'Карточка A' },
    { id: 2, title: 'Карточка B' },
    { id: 3, title: 'Карточка C' },
  ]);
  readonly cardEls = viewChildren<ElementRef<HTMLElement>>('cardEl');

  async shuffle() {
    await this.anim.animate(                            // 2. Вызвать animate()
      () => this.cardEls().map(r => r.nativeElement),  //    колбэк элементов
      () => this.cards.update(arr => shuffleArr(arr)), //    изменение данных
    );
  }
}
```

> **Важно:** `providers: [CardAnimationService]` в декораторе компонента обязателен.
> Это даёт каждому экземпляру компонента независимый сервис — аналогично `useCardAnimation()` в Vue/React.

---

## Метод `animate()` — рекомендуемый

```typescript
animate(
  getElements: () => Iterable<HTMLElement>,
  updateState: () => void,
): Promise<void>
```

Высокоуровневый метод: управляет полным FLIP-циклом самостоятельно.

**Что происходит внутри:**

1. `getElements()` — снимает позиции карточек **до** изменения (шаг First)
2. `updateState()` — вы меняете данные (сигнал, массив)
3. Ждёт Angular render-цикл (фаза `read` — DOM полностью стабилен)
4. `getElements()` — получает актуальные элементы **после** рендера
5. Запускает FLIP-анимацию

**Параметры:**

| Параметр | Описание |
|----------|---------|
| `getElements` | Колбэк, возвращающий актуальные DOM-элементы. Вызывается **дважды**: до и после render |
| `updateState` | Функция изменения данных. Вызывается между снимками |

**Поведение при misuse:**

- Если `animate()` вызван пока `isAnimating() === true` — выводит `console.warn` и возвращает управление без ошибки
- Если сервис создан вне Angular DI (без `providers: [CardAnimationService]`) — бросает `Error` с понятным сообщением

---

## Ручной контроль — `snapshot()` + `animateMove()`

Низкоуровневый API остаётся доступным для сценариев, где нужен явный контроль над render-циклом:

```typescript
import { Component, ElementRef, Injector, afterNextRender, inject, viewChildren } from '@angular/core';
import { CardAnimationService } from '@motionlab/motionkit/angular';

@Component({
  providers: [CardAnimationService],
  // ...
})
export class CardListComponent {
  private readonly anim = inject(CardAnimationService);
  private readonly injector = inject(Injector);         // нужен для afterNextRender
  readonly cardEls = viewChildren<ElementRef<HTMLElement>>('cardEl');

  async shuffle() {
    const elements = this.cardEls().map(r => r.nativeElement);

    this.anim.snapshot(elements);                       // 1. снимок «до»

    this.cards.update(arr => shuffleArr(arr));          // 2. меняем данные

    await new Promise<void>(resolve => {               // 3. ждём render
      afterNextRender({ read: resolve }, { injector: this.injector });
    });

    await this.anim.animateMove(                       // 4. анимируем
      this.cardEls().map(r => r.nativeElement),
    );
  }
}
```

> **Когда использовать:** если нужен дополнительный код между снимком и анимацией, или если `Injector` уже доступен в компоненте по другой причине.

---

## Настройка параметров — `configure()`

```typescript
this.anim.configure({
  duration: 400,        // мс (по умолчанию 300)
  easing: 'ease-out',  // CSS-функция (по умолчанию 'ease')
  stagger: 30,         // задержка между карточками в мс (по умолчанию 0)
});
```

Вызывать можно в любой момент — настройки применяются к следующей анимации.

**Пример с динамическими параметрами:**

```typescript
readonly duration = signal(400);

async shuffle() {
  this.anim.configure({ duration: this.duration() });
  await this.anim.animate(
    () => this.cardEls().map(r => r.nativeElement),
    () => this.cards.update(arr => shuffleArr(arr)),
  );
}
```

---

## `isAnimating` Signal

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

## Почему `animate()` требует DI?

Метод `animate()` использует Angular [`afterNextRender`](https://angular.dev/api/core/afterNextRender) для ожидания следующего render-цикла. Эта функция требует **injection context** — сведений о том, в каком компоненте она вызывается.

Сервис захватывает `Injector` в момент создания Angular DI-контейнером (когда компонент указывает `providers: [CardAnimationService]`). Поэтому сервис, созданный через `new CardAnimationService()` напрямую (вне DI), не может использовать `animate()`.

Если ты хочешь управлять render-циклом вручную — используй `snapshot()` + `animateMove()`.

---

## Полный пример с несколькими параметрами

```typescript
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
  readonly cards = signal([...INITIAL_CARDS]);
  readonly duration = signal(500);
  readonly stagger = signal(30);
  readonly cardEls = viewChildren<ElementRef<HTMLElement>>('cardEl');

  async shuffle() {
    if (this.anim.isAnimating()) return;

    this.anim.configure({
      duration: this.duration(),
      stagger: this.stagger(),
    });

    await this.anim.animate(
      () => this.cardEls().map(r => r.nativeElement),
      () => this.cards.update(arr => shuffleArr(arr)),
    );
  }
}
```

---

## See Also

- [API Reference](api.md) — полная документация `CardAnimationService`
- [Начало работы](getting-started.md) — установка и базовые примеры
- [Vue интеграция](vue.md) — `useCardAnimation` composable
- [React интеграция](react.md) — `useCardAnimation` hook
