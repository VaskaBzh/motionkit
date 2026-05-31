import { bootstrapApplication } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { AppComponent } from './App.component';
import './style.css';

bootstrapApplication(AppComponent, {
	providers: [provideZonelessChangeDetection()],
}).catch(console.error);
