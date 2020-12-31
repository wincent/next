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
    'prettier/@typescript-eslint',
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
    'notice/notice': [
      'error',
      {
        templateFile: 'config/copyright.js.txt',
      },
    ],
  },
};
