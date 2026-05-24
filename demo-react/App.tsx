import type { JSX } from 'react';
import { useState } from 'react';
import ShuffleDemo from './components/ShuffleDemo.tsx';
import DynamicDemo from './components/DynamicDemo.tsx';

type Tab = 'shuffle' | 'dynamic';

export default function App(): JSX.Element {
	const [tab, setTab] = useState<Tab>('shuffle');

	return (
		<div className="demo-layout">
			<header className="demo-header">
				<h1>motion<span>.js</span> React demo</h1>
				<nav className="tabs">
					<button
						className={`tab-btn${tab === 'shuffle' ? ' tab-btn--active' : ''}`}
						onClick={() => { setTab('shuffle'); }}
					>
						Shuffle
					</button>
					<button
						className={`tab-btn${tab === 'dynamic' ? ' tab-btn--active' : ''}`}
						onClick={() => { setTab('dynamic'); }}
					>
						Dynamic
					</button>
				</nav>
			</header>

			{tab === 'shuffle' ? <ShuffleDemo /> : <DynamicDemo />}
		</div>
	);
}
