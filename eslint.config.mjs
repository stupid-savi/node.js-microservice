// @ts-check
import globals from 'globals'
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      globals: {
        // ...globals.browser,
        ...globals.node,
        NodeJS: true,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },

      // globals: {
      //   process: true,
      //   console: true, // Add this to recognize process as a global
      // },
    },
  },

  {
    ignores: [
      'dist',
      'tests',
      'node-modules',
      'eslint.config.mjs',
      'jest.config.js',
      'scripts',
      "*.spec.ts",
      "tests"
    ],
  },

  {
    rules: {
      'no-console': 'off', // Warn about console statements
      'no-unused-vars': 'off', // Warn about unused variables
      'no-undef': 'off', // Error if an undeclared variable is used
      eqeqeq: ['error', 'always'], // Enforce strict equality (=== and !==)
      curly: 'error', // Enforce consistent braces for control statements
      'consistent-return': 'off', // Ensure consistent return statements in functions
      'no-shadow': 'error', // Prevent variable shadowing
      'no-duplicate-imports': 'error', // Disallow duplicate imports
      'no-alert': 'warn', // Warn about the use of alert(), prompt(), and confirm()
      'prefer-const': 'warn', // Suggest using const if variables are never reassigned
      'no-var': 'error', // Disallow the use of var; prefer let/const
      'no-mixed-spaces-and-tabs': 'error', // Disallow mixed spaces and tabs for indentation
      'no-else-return': 'error',
      'arrow-body-style': ['off', 'always'], // let foo = () => 0; ❌ let foo = () => {} ✅
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unused-vars': [
        'off',
        { argsIgnorePattern: '^_' },
      ],
    },
  },

)
