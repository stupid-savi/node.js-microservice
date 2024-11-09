// @ts-check

import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        process: true,
        console: true, // Add this to recognize process as a global
      },
    },
  },

  {
    ignores: ['dist', 'node-modules', 'eslint.config.mjs'],
  },

  {
    rules: {
      'no-console': 'off', // Warn about console statements
      'no-unused-vars': 'warn', // Warn about unused variables
      'no-undef': 'error', // Error if an undeclared variable is used
      eqeqeq: ['error', 'always'], // Enforce strict equality (=== and !==)
      curly: 'error', // Enforce consistent braces for control statements
      'consistent-return': 'error', // Ensure consistent return statements in functions
      'no-shadow': 'error', // Prevent variable shadowing
      'no-duplicate-imports': 'error', // Disallow duplicate imports
      'no-alert': 'warn', // Warn about the use of alert(), prompt(), and confirm()
      'prefer-const': 'warn', // Suggest using const if variables are never reassigned
      'no-var': 'error', // Disallow the use of var; prefer let/const
      'no-mixed-spaces-and-tabs': 'error', // Disallow mixed spaces and tabs for indentation
      'no-else-return': 'error',
      'arrow-body-style': ['error', 'always'], // let foo = () => 0; ❌ let foo = () => {} ✅
    },
  },
)
