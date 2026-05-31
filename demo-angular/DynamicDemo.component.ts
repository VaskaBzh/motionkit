import { Component, ElementRef, Injector, afterNextRender, inject, signal, viewChildren } from '@angular/core';
import { CardAnimationService } from '../src/angular';

interface Card {
	id: number;
	title: string;
	color: string;
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#14b8a6'];
const TITLES = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta'];

let nextId = 7;

const INITIAL_CARDS: Card[] = [
	{ id: 1, title: 'Alpha', color: '#ef4444' },
	{ id: 2, title: 'Beta', color: '#f97316' },
	{ id: 3, title: 'Gamma', color: '#eab308' },
	{ id: 4, title: 'Delta', color: '#22c55e' },
];

@Component({
	selector: 'app-dynamic-demo',
	standalone: true,
	providers: [CardAnimationService],
	template: `
		<div class="dynamic-controls">
			<button class="btn-add" [disabled]="anim.isAnimating()" (click)="addCard()">
				+ Добавить
			</button>
			<button class="btn-remove" [disabled]="anim.isAnimating() || cards().length === 0" (click)="removeCard()">
				− Удалить
			</button>
		</div>

		<div class="card-grid">
			@for (card of cards(); track card.id) {
				<div class="card" #cardEl [style.--card-color]="card.color">
					<span class="card__title">{{ card.title }}</span>
					<span class="card__id">#{{ card.id }}</span>
				</div>
			}
		</div>
	`,
})
export class DynamicDemoComponent {
	protected readonly anim = inject(CardAnimationService);
	private readonly injector = inject(Injector);

	readonly cards = signal<Card[]>([...INITIAL_CARDS]);
	readonly cardEls = viewChildren<ElementRef<HTMLElement>>('cardEl');

	async addCard(): Promise<void> {
		if (this.anim.isAnimating()) return;

		const id = nextId++;
		const color = COLORS[id % COLORS.length]!;
		const title = TITLES[id % TITLES.length]!;

		const elements = this.cardEls().map(r => r.nativeElement);
		this.anim.snapshot(elements);

		this.cards.update(arr => [...arr, { id, title, color }]);

		await new Promise<void>(resolve => {
			afterNextRender({ read: resolve }, { injector: this.injector });
		});

		await this.anim.animateMove(this.cardEls().map(r => r.nativeElement));
	}

	async removeCard(): Promise<void> {
		if (this.anim.isAnimating() || this.cards().length === 0) return;

		const elements = this.cardEls().map(r => r.nativeElement);
		this.anim.snapshot(elements);

		this.cards.update(arr => arr.slice(0, -1));

		await new Promise<void>(resolve => {
			afterNextRender({ read: resolve }, { injector: this.injector });
		});

		await this.anim.animateMove(this.cardEls().map(r => r.nativeElement));
	}
}
