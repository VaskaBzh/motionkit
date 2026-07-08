import { Component, signal } from '@angular/core';
import { ShuffleDemoComponent } from './ShuffleDemo.component';
import { DynamicDemoComponent } from './DynamicDemo.component';

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [ShuffleDemoComponent, DynamicDemoComponent],
	template: `
		<div class="demo-layout">
			<header class="demo-header">
				<h1><a href="../index.html">motion<span>.js</span></a> — Angular</h1>
			</header>

			<pre class="usage"><code>anim = inject(CardAnimationService);   // providers: [CardAnimationService]
anim.snapshot(els);                    // First: capture positions
cards.update(shuffle);                 // reorder
await anim.animateMove(els);           // Invert → Play</code></pre>

			<nav class="tabs">
				<button class="tab-btn" [class.active]="tab() === 'shuffle'" (click)="tab.set('shuffle')">
					Shuffle
				</button>
				<button class="tab-btn" [class.active]="tab() === 'dynamic'" (click)="tab.set('dynamic')">
					Dynamic
				</button>
			</nav>

			@if (tab() === 'shuffle') {
				<app-shuffle-demo />
			} @else {
				<app-dynamic-demo />
			}
		</div>
	`,
})
export class AppComponent {
	readonly tab = signal<'shuffle' | 'dynamic'>('shuffle');
}
