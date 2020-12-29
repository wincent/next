/**
 * SPDX-FileCopyrightText: Copyright 2020 Greg Hurrell
 * SPDX-License-Identifier: MIT
 */

import git from '../git';

describe('git()', () => {
  it('returns the output from the command', () => {
    expect(git('ls-tree', 'HEAD')).toMatch(/^\d{6} blob [a-f0-9]{40}\t/m);
  });
});
