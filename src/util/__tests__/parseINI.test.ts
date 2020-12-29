/**
 * SPDX-FileCopyrightText: Copyright 2020 Greg Hurrell
 * SPDX-License-Identifier: MIT
 */

import fs from 'fs';
import path from 'path';

import parseINI from '../parseINI';

describe('parseINI()', () => {
  it('exposes a key for looking up section data', () => {
    expect(typeof parseINI.SECTIONS).toBe('symbol');
  });

  it('parses an empty config', () => {
    expect(parseINI('')).toEqual({
      [parseINI.SECTIONS]: {},
    });
  });

  it('ignores comments', () => {
    const example = `
      ; hey, I'm a comment
      foo = bar etc
      baz = 1
    `;

    expect(parseINI(example)).toEqual({
      foo: 'bar etc',
      baz: '1',
      [parseINI.SECTIONS]: {},
    });
  });

  it('overwrites repeated values', () => {
    const example = `
      foo = bar etc
      baz = 1
      foo = nah
    `;

    expect(parseINI(example)).toEqual({
      foo: 'nah',
      baz: '1',
      [parseINI.SECTIONS]: {},
    });
  });

  it('parses sections', () => {
    const example = `
      foo = bar etc
      baz = 1

      [client]
      host = localhost
      port = 1000

      [server]
      logging = true
      port = 1001
    `;

    expect(parseINI(example)).toEqual({
      foo: 'bar etc',
      baz: '1',
      [parseINI.SECTIONS]: {
        client: {
          host: 'localhost',
          port: '1000',
        },
        server: {
          logging: 'true',
          port: '1001',
        },
      },
    });
  });

  it('allows repeated sections', () => {
    const example = `
      foo = bar etc
      baz = 1

      [client]
      host = localhost
      port = 1000

      [server]
      logging = true
      port = 1001

      [client]
      port = 1002
      other = stuff
    `;

    expect(parseINI(example)).toEqual({
      foo: 'bar etc',
      baz: '1',
      [parseINI.SECTIONS]: {
        client: {
          host: 'localhost',
          port: '1002',
          other: 'stuff',
        },
        server: {
          logging: 'true',
          port: '1001',
        },
      },
    });
  });

  it('parses the project .nextrc', () => {
    const nextrc = fs.readFileSync(
      path.join(__dirname, '..', '..', '..', '.nextrc'),
      'utf8'
    );

    expect(parseINI(nextrc)).toEqual({
      branch: 'tasks',
      worktree: 'tasks',
      [parseINI.SECTIONS]: {},
    });
  });
});
