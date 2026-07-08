import type { JSX } from 'react';
import { useState, useRef, useEffect } from 'react';
import { useCardAnimation } from '../../src/react';

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

function shuffleArray<T>(arr: T[]): T[] {
	const result = [...arr];
	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[result[i], result[j]] = [result[j], result[i]];
	}
	return result;
}

export default function ShuffleDemo(): JSX.Element {
	const [cards, setCards] = useState<Card[]>(INITIAL_CARDS);
	const [duration, setDuration] = useState(500);
	const [stagger, setStagger] = useState(30);
	const [easing, setEasing] = useState('ease');

	const cardRefs = useRef<(HTMLElement | null)[]>([]);
	const shouldAnimate = useRef(false);

	const { snapshot, animateMove, isAnimating } = useCardAnimation({ duration, easing, stagger });

	useEffect(() => {
		if (!shouldAnimate.current) return;
		shouldAnimate.current = false;
		void animateMove(cardRefs.current.filter((el): el is HTMLElement => el !== null));
	}, [cards, animateMove]);

	const handleShuffle = (): void => {
		snapshot(cardRefs.current.filter((el): el is HTMLElement => el !== null));
		shouldAnimate.current = true;
		setCards(prev => shuffleArray(prev));
	};

	return (
		<>
			<div className="controls">
				<label className="control">
					<span className="control__label">duration</span>
					<div className="control__row">
						<input
							type="range" min={100} max={3000} step={50}
							value={duration}
							onChange={e => { setDuration(Number(e.target.value)); }}
						/>
						<span className="control__value">{duration}ms</span>
					</div>
				</label>

				<label className="control">
					<span className="control__label">stagger</span>
					<div className="control__row">
						<input
							type="range" min={0} max={300} step={10}
							value={stagger}
							onChange={e => { setStagger(Number(e.target.value)); }}
						/>
						<span className="control__value">{stagger}ms</span>
					</div>
				</label>

				<label className="control">
					<span className="control__label">easing</span>
					<div className="control__row">
						<select value={easing} onChange={e => { setEasing(e.target.value); }}>
							<option value="ease">ease</option>
							<option value="ease-in">ease-in</option>
							<option value="ease-out">ease-out</option>
							<option value="ease-in-out">ease-in-out</option>
							<option value="linear">linear</option>
							<option value="cubic-bezier(0.34, 1.56, 0.64, 1)">spring</option>
						</select>
					</div>
				</label>

				<button className="btn-shuffle" disabled={isAnimating} onClick={handleShuffle}>
					{isAnimating ? 'Анимация…' : 'Перемешать'}
				</button>
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
