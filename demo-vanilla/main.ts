import { AnimationBuilder } from '../src/core/src';
import './style.css';

interface Card { id: number; title: string; color: string; }

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#14b8a6'];
const LABELS = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta'];
const MAX_CARDS = 12;

function makeCardEl(card: Card): HTMLElement {
  const tpl = document.getElementById('card-tpl') as HTMLTemplateElement;
  const el = (tpl.content.cloneNode(true) as DocumentFragment).querySelector<HTMLElement>('.card')!;
  el.style.setProperty('--card-color', card.color);
  el.dataset['id'] = String(card.id);
  el.querySelector('.card__title')!.textContent = card.title;
  el.querySelector('.card__id')!.textContent = `#${card.id}`;
  return el;
}

function getCards(grid: HTMLElement): HTMLElement[] {
  return Array.from(grid.querySelectorAll<HTMLElement>('.card'));
}

// ── Shuffle Demo ─────────────────────────────────────────────────────────────

function mountShuffleDemo(): void {
  const grid = document.getElementById('s-grid')!;
  const btn = document.getElementById('s-shuffle') as HTMLButtonElement;
  const durationInput = document.getElementById('s-duration') as HTMLInputElement;
  const durationVal = document.getElementById('s-duration-val')!;
  const staggerInput = document.getElementById('s-stagger') as HTMLInputElement;
  const staggerVal = document.getElementById('s-stagger-val')!;
  const easingSelect = document.getElementById('s-easing') as HTMLSelectElement;

  durationInput.addEventListener('input', () => { durationVal.textContent = `${durationInput.value}ms`; });
  staggerInput.addEventListener('input', () => { staggerVal.textContent = `${staggerInput.value}ms`; });

  const initialCards: Card[] = [
    { id: 1, title: 'Карточка A', color: COLORS[0] },
    { id: 2, title: 'Карточка B', color: COLORS[1] },
    { id: 3, title: 'Карточка C', color: COLORS[2] },
    { id: 4, title: 'Карточка D', color: COLORS[3] },
    { id: 5, title: 'Карточка E', color: COLORS[4] },
    { id: 6, title: 'Карточка F', color: COLORS[5] },
  ];
  initialCards.forEach(card => { grid.appendChild(makeCardEl(card)); });

  const builder = new AnimationBuilder();
  let animating = false;

  btn.addEventListener('click', () => {
    if (animating) return;

    builder
      .withDuration(Number(durationInput.value))
      .withStagger(Number(staggerInput.value))
      .withEasing(easingSelect.value);

    const cards = getCards(grid);
    builder.snapshot(cards);

    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const elI = cards[i]!;
      const elJ = cards[j]!;
      const afterI = elI.nextSibling;
      const afterJ = elJ.nextSibling;
      grid.insertBefore(elJ, afterI);
      if (afterJ === elI) {
        grid.insertBefore(elI, elJ);
      } else {
        grid.insertBefore(elI, afterJ);
      }
    }

    animating = true;
    btn.disabled = true;
    btn.textContent = 'Анимация…';

    void builder.buildAnimation(getCards(grid)).play().then(() => {
      animating = false;
      btn.disabled = false;
      btn.textContent = 'Перемешать';
    });
  });
}

// ── Dynamic Demo ─────────────────────────────────────────────────────────────

function mountDynamicDemo(): void {
  let nextId = 5;
  function newCard(): Card {
    const idx = nextId % COLORS.length;
    return { id: nextId++, title: `Карточка ${LABELS[idx] ?? String(nextId)}`, color: COLORS[idx] ?? '#6366f1' };
  }

  const grid = document.getElementById('d-grid')!;
  const counter = document.getElementById('d-counter')!;
  const btns = {
    addStart: document.getElementById('d-add-start') as HTMLButtonElement,
    addEnd: document.getElementById('d-add-end') as HTMLButtonElement,
    addMid: document.getElementById('d-add-mid') as HTMLButtonElement,
    removeFirst: document.getElementById('d-remove-first') as HTMLButtonElement,
    removeLast: document.getElementById('d-remove-last') as HTMLButtonElement,
  };

  const initialCards: Card[] = [
    { id: 1, title: 'Карточка Alpha', color: COLORS[0] },
    { id: 2, title: 'Карточка Beta', color: COLORS[1] },
    { id: 3, title: 'Карточка Gamma', color: COLORS[2] },
    { id: 4, title: 'Карточка Delta', color: COLORS[3] },
  ];
  initialCards.forEach(card => { grid.appendChild(makeCardEl(card)); });

  const builder = new AnimationBuilder();
  let animating = false;

  function updateButtons(): void {
    const count = grid.childElementCount;
    const full = count >= MAX_CARDS;
    const empty = count === 0;
    counter.textContent = `${count} / ${MAX_CARDS} карточек`;
    btns.addStart.disabled = animating || full;
    btns.addEnd.disabled = animating || full;
    btns.addMid.disabled = animating || full;
    btns.removeFirst.disabled = animating || empty;
    btns.removeLast.disabled = animating || empty;
  }

  function animate(action: () => void): void {
    if (animating) return;
    builder.withDuration(400).withStagger(25);
    builder.snapshot(getCards(grid));
    action();
    animating = true;
    updateButtons();
    void builder.buildAnimation(getCards(grid)).play().then(() => {
      animating = false;
      updateButtons();
    });
  }

  btns.addStart.addEventListener('click', () => {
    animate(() => { grid.insertBefore(makeCardEl(newCard()), grid.firstChild); });
  });
  btns.addEnd.addEventListener('click', () => {
    animate(() => { grid.appendChild(makeCardEl(newCard())); });
  });
  btns.addMid.addEventListener('click', () => {
    animate(() => {
      const children = getCards(grid);
      const mid = Math.floor(children.length / 2);
      grid.insertBefore(makeCardEl(newCard()), children[mid] ?? null);
    });
  });
  btns.removeFirst.addEventListener('click', () => {
    animate(() => { grid.firstElementChild?.remove(); });
  });
  btns.removeLast.addEventListener('click', () => {
    animate(() => { grid.lastElementChild?.remove(); });
  });

  updateButtons();
}

// ── App shell ────────────────────────────────────────────────────────────────

function mount(): void {
  const tabBtns = document.querySelectorAll<HTMLButtonElement>('.tab-btn');
  const sections: Record<string, HTMLElement> = {
    shuffle: document.getElementById('tab-shuffle')!,
    dynamic: document.getElementById('tab-dynamic')!,
  };

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset['tab'] ?? 'shuffle';
      tabBtns.forEach(b => { b.classList.toggle('tab-btn--active', b.dataset['tab'] === tab); });
      Object.entries(sections).forEach(([key, el]) => { el.hidden = key !== tab; });
    });
  });

  mountShuffleDemo();
  mountDynamicDemo();
}

mount();
