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
      files: ['*.js'],
      env: {node: true},
    },
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'jest', 'notice'],
  root: true,
  rules: {
    'notice/notice': [
      'error',
      {
        templateFile: 'config/copyright.js.txt',
      },
    ],
  },
};
