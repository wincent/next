/**
 * SPDX-FileCopyrightText: Copyright 2020 Greg Hurrell
 * SPDX-License-Identifier: MIT
 */

module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:jest/recommended',
    'prettier',
  ],
  overrides: [
    {
      files: ['*.js', 'bin/*'],
      env: {node: true},
    },
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'jest', 'notice'],
  root: true,
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', {argsIgnorePattern: '^_'}],
    '@typescript-eslint/no-var-requires': 'off',
    'notice/notice': ['error', {templateFile: 'config/copyright.js.txt'}],
    'prefer-const': ['error', {destructuring: 'all'}],
  },
};
