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
				<h1>motion<span>.js</span> — Angular</h1>
			</header>

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
