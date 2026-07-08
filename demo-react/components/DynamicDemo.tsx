import type { JSX } from 'react';
import { useState, useRef, useEffect } from 'react';
import { useCardAnimation } from '../../src/react';

interface Card {
	id: number;
	title: string;
	color: string;
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#14b8a6'];
const LABELS = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta'];
const MAX_CARDS = 12;

let nextId = 5;

function newCard(): Card {
	const idx = nextId % COLORS.length;
	return { id: nextId++, title: `Карточка ${LABELS[idx]}`, color: COLORS[idx] };
}

const INITIAL_CARDS: Card[] = [
	{ id: 1, title: 'Карточка Alpha', color: COLORS[0] },
	{ id: 2, title: 'Карточка Beta', color: COLORS[1] },
	{ id: 3, title: 'Карточка Gamma', color: COLORS[2] },
	{ id: 4, title: 'Карточка Delta', color: COLORS[3] },
];

export default function DynamicDemo(): JSX.Element {
	const [cards, setCards] = useState<Card[]>(INITIAL_CARDS);

	const cardRefs = useRef<(HTMLElement | null)[]>([]);
	const shouldAnimate = useRef(false);

	const { snapshot, animateMove, isAnimating } = useCardAnimation({ duration: 400, stagger: 25 });

	useEffect(() => {
		if (!shouldAnimate.current) return;
		shouldAnimate.current = false;
		void animateMove(cardRefs.current.filter((el): el is HTMLElement => el !== null));
	}, [cards, animateMove]);

	const triggerChange = (updater: (prev: Card[]) => Card[]): void => {
		snapshot(cardRefs.current.filter((el): el is HTMLElement => el !== null));
		shouldAnimate.current = true;
		setCards(updater);
	};

	const addStart = (): void => { triggerChange(prev => [newCard(), ...prev]); };
	const addEnd = (): void => { triggerChange(prev => [...prev, newCard()]); };
	const addMiddle = (): void => {
		triggerChange(prev => {
			const mid = Math.floor(prev.length / 2);
			return [...prev.slice(0, mid), newCard(), ...prev.slice(mid)];
		});
	};
	const removeFirst = (): void => { triggerChange(prev => prev.slice(1)); };
	const removeLast = (): void => { triggerChange(prev => prev.slice(0, -1)); };

	const full = cards.length >= MAX_CARDS;
	const empty = cards.length === 0;

	return (
		<>
			<div className="dynamic-actions">
				<button className="btn-action" onClick={addStart} disabled={isAnimating || full}>+ в начало</button>
				<button className="btn-action" onClick={addEnd} disabled={isAnimating || full}>+ в конец</button>
				<button className="btn-action" onClick={addMiddle} disabled={isAnimating || full}>+ в середину</button>
				<button className="btn-action" onClick={removeFirst} disabled={isAnimating || empty}>− первую</button>
				<button className="btn-action" onClick={removeLast} disabled={isAnimating || empty}>− последнюю</button>
				<span className="card-counter">{cards.length} / {MAX_CARDS} карточек</span>
			</div>

			<div className="card-grid">
				{cards.map((card, i) => (
					<div
						key={card.id}
						ref={el => { cardRefs.current[i] = el; }}
						className="card"
						style={{ '--card-color': card.color } as React.CSSProperties}
					>
						<span className="card__title">{card.title}</span>
						<span className="card__id">#{card.id}</span>
					</div>
				))}
			</div>
		</>
	);
}
