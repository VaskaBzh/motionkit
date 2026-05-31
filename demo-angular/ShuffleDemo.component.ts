import { Component, ElementRef, inject, signal, viewChildren } from '@angular/core';
import { CardAnimationService } from '../src/angular';

interface Card {
	id: number;
	title: string;
	color: string;
}

const INITIAL_CARDS: Card[] = [
	{ id: 1, title: 'Карточка A', color: '#ef4444' },
	{ id: 2, title: 'Карточка B', color: '#f97316' },
	{ id: 3, title: 'Карточка C', color: '#eab308' },
	{ id: 4, title: 'Карточка D', color: '#22c55e' },
	{ id: 5, title: 'Карточка E', color: '#3b82f6' },
	{ id: 6, title: 'Карточка F', color: '#a855f7' },
];

@Component({
	selector: 'app-shuffle-demo',
	standalone: true,
	providers: [CardAnimationService],
	template: `
		<div class="controls">
			<label class="control">
				<span class="control__label">duration</span>
				<div class="control__row">
					<input type="range" min="100" max="3000" step="50"
						[value]="duration()" (input)="duration.set(+$any($event.target).value)" />
					<span class="control__value">{{ duration() }}ms</span>
				</div>
			</label>
			<label class="control">
				<span class="control__label">stagger</span>
				<div class="control__row">
					<input type="range" min="0" max="300" step="10"
						[value]="stagger()" (input)="stagger.set(+$any($event.target).value)" />
					<span class="control__value">{{ stagger() }}ms</span>
				</div>
			</label>
			<label class="control">
				<span class="control__label">easing</span>
				<div class="control__row">
					<select [value]="easing()" (change)="easing.set($any($event.target).value)">
						<option value="ease">ease</option>
						<option value="ease-in">ease-in</option>
						<option value="ease-out">ease-out</option>
						<option value="ease-in-out">ease-in-out</option>
						<option value="linear">linear</option>
						<option value="cubic-bezier(0.34, 1.56, 0.64, 1)">spring</option>
					</select>
				</div>
			</label>
		</div>

		<button class="btn-shuffle" [disabled]="anim.isAnimating()" (click)="shuffle()">
			{{ anim.isAnimating() ? 'Анимация…' : 'Перемешать' }}
		</button>

		<br /><br />

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
export class ShuffleDemoComponent {
	protected readonly anim = inject(CardAnimationService);

	readonly cards = signal<Card[]>([...INITIAL_CARDS]);
	readonly duration = signal(500);
	readonly stagger = signal(30);
	readonly easing = signal('ease');

	readonly cardEls = viewChildren<ElementRef<HTMLElement>>('cardEl');

	async shuffle(): Promise<void> {
		if (this.anim.isAnimating()) return;

		this.anim.configure({
			duration: this.duration(),
			stagger: this.stagger(),
			easing: this.easing(),
		});

		await this.anim.animate(
			() => this.cardEls().map(r => r.nativeElement),
			() => this.cards.update(arr => {
				const copy = [...arr];
				for (let i = copy.length - 1; i > 0; i--) {
					const j = Math.floor(Math.random() * (i + 1));
					[copy[i], copy[j]] = [copy[j]!, copy[i]!];
				}
				return copy;
			}),
		);
	}
}
