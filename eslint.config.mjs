// @ts-check

import tseslint from 'typescript-eslint'

export default tseslint.config(
    tseslint.configs.recommended,
    {
        ignores: ['**/build/**']
    },
    {
        rules: {
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": [
                "error", // or "error"
                {
                    "argsIgnorePattern": "^_",
                    "varsIgnorePattern": "^_",
                    "caughtErrorsIgnorePattern": "^_"
                }
            ]
        }
    }
)
