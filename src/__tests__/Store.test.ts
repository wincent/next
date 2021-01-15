/**
 * SPDX-FileCopyrightText: Copyright 2021 Greg Hurrell
 * SPDX-License-Identifier: MIT
 */

import Store, {checkFilename, parseTaskDescription} from '../Store';

describe('checkFilename()', () => {
  it('accepts a valid filename', () => {
    expect(() => checkFilename('yo there')).not.toThrow();
  });

  it('complains about "/"', () => {
    expect(() => checkFilename('this/thing')).toThrow(
      /"this\/thing" must contain only legal filename characters/
    );
  });

  it('complains about ":"', () => {
    expect(() => checkFilename('that:thing')).toThrow(
      /"that:thing" must contain only legal filename characters/
    );
  });

  it('complains about NUL bytes', () => {
    expect(() => checkFilename('bad\0')).toThrow(
      /"bad\\u0000" must contain only legal filename characters/
    );
  });
});

describe('parseTaskDescription()', () => {
  it('returns a basic description', () => {
    expect(parseTaskDescription('Buy eggs')).toEqual({
      area: null,
      project: null,
      raw: 'Buy eggs',
      text: 'Buy eggs',
    });
  });

  it('extracts a project', () => {
    expect(parseTaskDescription('Buy eggs @Shopping')).toEqual({
      area: null,
      project: 'Shopping',
      raw: 'Buy eggs @Shopping',
      text: 'Buy eggs',
    });

    expect(parseTaskDescription('Buy @Shopping eggs')).toEqual({
      area: null,
      project: 'Shopping',
      raw: 'Buy @Shopping eggs',
      text: 'Buy eggs',
    });

    expect(parseTaskDescription('@Shopping Buy eggs')).toEqual({
      area: null,
      project: 'Shopping',
      raw: '@Shopping Buy eggs',
      text: 'Buy eggs',
    });
  });

  it('extracts an area', () => {
    expect(parseTaskDescription('Buy eggs @Personal/')).toEqual({
      area: 'Personal',
      project: null,
      raw: 'Buy eggs @Personal/',
      text: 'Buy eggs',
    });

    expect(parseTaskDescription('Buy @Personal/ eggs')).toEqual({
      area: 'Personal',
      project: null,
      raw: 'Buy @Personal/ eggs',
      text: 'Buy eggs',
    });

    expect(parseTaskDescription('@Personal/ Buy eggs')).toEqual({
      area: 'Personal',
      project: null,
      raw: '@Personal/ Buy eggs',
      text: 'Buy eggs',
    });
  });

  it('extracts a project in an area', () => {
    expect(parseTaskDescription('Buy eggs @Shopping/Groceries')).toEqual({
      area: 'Shopping',
      project: 'Groceries',
      raw: 'Buy eggs @Shopping/Groceries',
      text: 'Buy eggs',
    });

    expect(parseTaskDescription('Buy @Shopping/Groceries eggs')).toEqual({
      area: 'Shopping',
      project: 'Groceries',
      raw: 'Buy @Shopping/Groceries eggs',
      text: 'Buy eggs',
    });

    expect(parseTaskDescription('@Shopping/Groceries Buy eggs')).toEqual({
      area: 'Shopping',
      project: 'Groceries',
      raw: '@Shopping/Groceries Buy eggs',
      text: 'Buy eggs',
    });
  });

  it('uses last-seen project', () => {
    expect(parseTaskDescription('Do elevator pitch @one @two @three')).toEqual({
      area: null,
      project: 'three',
      raw: 'Do elevator pitch @one @two @three',
      text: 'Do elevator pitch',
    });
  });

  it('complains about invalid area/project names', () => {
    expect(() =>
      parseTaskDescription('Break the system @right/now/ok')
    ).toThrow('Invalid area/project "@right/now/ok"');
  });

  it('does not confuse an email address with a project or area', () => {
    expect(parseTaskDescription('Email bob@example.com')).toEqual({
      area: null,
      project: null,
      raw: 'Email bob@example.com',
      text: 'Email bob@example.com',
    });
  });
});
