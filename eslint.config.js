// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config')
const expoConfig = require('eslint-config-expo/flat')

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  // Custom rules matching the main EmuReady website
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-redeclare': [
        'error',
        { ignoreDeclarationMerge: true },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      'no-case-declarations': 'off',
      'no-prototype-builtins': 'off',
      'no-redeclare': 'off',
      'no-useless-escape': 'off',
      'prefer-template': 'error',
    },
  },
  // files in types folder
  {
    files: ['types/**/*.ts'],
    rules: {
      '@typescript-eslint/no-redeclare': 'off',
    },
  },
])
