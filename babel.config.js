/**
 * SPDX-FileCopyrightText: Copyright 2020 Greg Hurrell
 * SPDX-License-Identifier: MIT
 */

module.exports = {
  presets: [
    ['@babel/preset-env', {targets: {node: '10'}}],
    '@babel/preset-typescript',
  ],
};
