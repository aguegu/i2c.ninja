import js from '@eslint/js';
import globals from 'globals';
import pluginVue from 'eslint-plugin-vue';
import { defineConfig } from 'eslint/config';
import stylistic from '@stylistic/eslint-plugin';

// as iap.meshmass.com's SPA and atiic: ESLint 10, @stylistic, and Vue's
export default defineConfig([
  { ignores: ['dist', 'node_modules'] },
  {
    files: ['*.config.js'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['**/*.{js,vue}'],
    plugins: { js, '@stylistic': stylistic },
    extends: ['js/recommended'],
    languageOptions: { globals: globals.browser },
    rules: {
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/comma-spacing': ['error', { 'before': false, 'after': true }],
      '@stylistic/key-spacing': ['error', { 'beforeColon': false }],
      '@stylistic/no-multiple-empty-lines': ['error', { max: 2 }],
      '@stylistic/no-trailing-spaces': 'error',
      '@stylistic/object-curly-spacing': ['error', 'always'],
      '@stylistic/semi': ['error', 'always'],
    },
  },
  ...pluginVue.configs['flat/recommended'],
]);
