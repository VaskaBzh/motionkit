import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
	plugins: [
		angular({
			tsconfig: './tsconfig.angular.json',
		}),
	],
	root: 'demo-angular',
	server: {
		port: 5174,
	},
});
