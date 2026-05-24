import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
	viteConfig,
	defineConfig({
		test: {
			environment: 'happy-dom',
			globals: true,
			include: ['src/**/*.{test,spec}.{ts,tsx}'],
			coverage: {
				provider: 'v8',
				include: ['src/**/*.ts'],
				exclude: ['src/**/*.{test,spec}.ts', 'src/**/index.ts'],
				reporter: ['text', 'html'],
			},
		},
	}),
);
