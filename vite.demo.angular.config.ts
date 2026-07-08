import { resolve } from 'path';
import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';

// The Angular demo needs the @analogjs compiler plugin, which cannot share a
// build with the Vue/React config, so it is built separately into a `angular/`
// subfolder of the shared `dist-demo` output and linked from the landing page.
export default defineConfig({
	plugins: [
		angular({
			tsconfig: './tsconfig.angular.json',
		}),
	],
	root: 'demo-angular',
	base: '/motionkit/angular/',
	build: {
		outDir: resolve(__dirname, 'dist-demo/angular'),
		emptyOutDir: true,
	},
	server: {
		port: 5174,
	},
});
