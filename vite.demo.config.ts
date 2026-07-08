import { resolve } from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import react from '@vitejs/plugin-react';

export default defineConfig({
	plugins: [vue(), react()],
	base: '/motionkit/',
	build: {
		outDir: 'dist-demo',
		rollupOptions: {
			input: {
				index: resolve(__dirname, 'index.html'),
				react: resolve(__dirname, 'react.html'),
				vue: resolve(__dirname, 'vue.html'),
				vanilla: resolve(__dirname, 'vanilla.html'),
			},
			external: [],
		},
	},
});
