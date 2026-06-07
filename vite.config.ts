import { resolve } from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

export default defineConfig({
	plugins: [
		vue(),
		react(),
		dts({ tsconfigPath: './tsconfig.build.json' }),
	],
	publicDir: false,
	build: {
		lib: {
			entry: {
				core: resolve(__dirname, 'src/core/index.ts'),
				vue: resolve(__dirname, 'src/vue/index.ts'),
				react: resolve(__dirname, 'src/react/index.ts'),
				angular: resolve(__dirname, 'src/angular/index.ts'),
			},
			formats: ['es', 'cjs'],
			fileName: (format, entryName) =>
				`${entryName}.${format === 'es' ? 'js' : 'cjs'}`,
		},
		rollupOptions: {
			external: ['vue', 'react', 'react-dom', '@angular/core'],
			output: {
				globals: { vue: 'Vue', react: 'React', 'react-dom': 'ReactDOM', '@angular/core': 'ng.core' },
			},
		},
	},
});
