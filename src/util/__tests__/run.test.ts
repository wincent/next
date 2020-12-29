/**
 * SPDX-FileCopyrightText: Copyright 2020 Greg Hurrell
 * SPDX-License-Identifier: MIT
 */

import run from '../run';

describe('run()', () => {
  it('can run a simple command', () => {
    expect(run('true')).toBe('');
  });

  it('returns the standard output', () => {
    expect(run('echo', 'hi', 'there')).toBe('hi there\n');
  });

  it('throws when the command cannot be found', () => {
    expect(() => run('non-existent-crap')).toThrow(/\bENOENT\b/);
  });

  it('throws when the command exits with a non-zero status', () => {
    expect(() => run('false')).toThrow('Command "false" exited with status 1');
  });
});
