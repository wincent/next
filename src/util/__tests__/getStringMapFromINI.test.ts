/**
 * SPDX-FileCopyrightText: Copyright 2021 Greg Hurrell
 * SPDX-License-Identifier: MIT
 */

import getStringMapFromINI from '../getStringMapFromINI';
import parseINI from '../parseINI';

describe('getStringMapFromINI()', () => {
  it('transforms a empty object', () => {
    const ini = parseINI('');

    expect(getStringMapFromINI(ini)).toEqual({});
  });

  it('transforms simple key value pairs', () => {
    const ini = parseINI(`
      foo = bar
      baz = boo
    `);

    expect(getStringMapFromINI(ini)).toEqual({foo: 'bar', baz: 'boo'});
  });

  it('transforms the string "null" to `null`', () => {
    const ini = parseINI(`
      foo = null
    `);

    expect(getStringMapFromINI(ini)).toEqual({foo: null});
  });

  it('ignores nested sections', () => {
    const ini = parseINI(`
      foo = bar
      baz = boo

      [nested]
      hidden = secrets
    `);

    expect(getStringMapFromINI(ini)).toEqual({foo: 'bar', baz: 'boo'});
  });
});
