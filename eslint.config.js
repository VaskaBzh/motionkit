import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
	eslint.configs.recommended,
	tseslint.configs.strictTypeChecked,
	{
		languageOptions: {
			parserOptions: {
				project: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
		rules: {
			'@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
			'@typescript-eslint/explicit-function-return-type': 'error',
			'@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
			'no-restricted-imports': ['error', {
				patterns: [
					{ regex: '\\.js$', message: 'Use .ts extension, not .js, for TypeScript file imports.' },
					{ regex: '/index\\.ts$', message: 'Import from the folder, not index.ts directly.' },
				],
			}],
		},
	},
	{
		ignores: ['node_modules', 'dist'],
	}
);
