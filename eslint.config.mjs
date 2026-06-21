// @ts-check

import tseslint from 'typescript-eslint'
import {defineConfig } from 'eslint/config'
import prettierConfig from 'eslint-config-prettier'

export default defineConfig(
    tseslint.configs.recommended,
    {
        ignores: ['**/build/**'],
    },
    {
        rules: {
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': [
                'error', // or "error"
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                },
            ],
        },
    },
    prettierConfig
)
