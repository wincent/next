/**
 * SPDX-FileCopyrightText: Copyright 2020 Greg Hurrell
 * SPDX-License-Identifier: MIT
 */

import StringScanner from './StringScanner';

const ASSIGNMENT_REGEXP = /[ \t]*=[ \t]*/;
const COMMENT_REGEXP = /[ \t]*;.*?(?:\r?\n|$)/;
const BLANK_LINE_REGEXP = /[ \t]*(?:\r?\n|$)/;
const KEY_REGEXP = /[ \t]*\w+[ \t]*/;
const SECTION_REGEXP = /[ \t]*\[[ \t]*\w+[ \t]*\][ \t]*(?:\r?\n|$)/;
const VALUE_REGEXP = /[ \t]*.*?(?:\r?\n|$)/;

const SECTIONS = Symbol('sections');

export type INI = {
  [key: string]: string;
  [SECTIONS]: {
    [section: string]: {
      [key: string]: string;
    };
  };
};

/**
 * Crude INI format parser.
 *
 * `file` parameter is optional (used only for error reporting).
 */
export default function parseINI(input: string, file?: string): INI {
  const sections: INI[typeof SECTIONS] = {};

  const ini = {
    [SECTIONS]: sections,
  };

  const scanner = new StringScanner(input, file);

  let current: INI | {[key: string]: string} = ini;

  while (!scanner.atEnd) {
    scanner.scan(BLANK_LINE_REGEXP);
    scanner.scan(COMMENT_REGEXP);

    let name = scanner.scan(SECTION_REGEXP)?.trim();

    if (name) {
      name = name.slice(1, -1);

      current = sections[name] || {};

      sections[name] = current;
    }

    const key = scanner.scan(KEY_REGEXP)?.trim();

    if (key) {
      scanner.expect(ASSIGNMENT_REGEXP, 'value assignment (=)');

      const value = scanner.expect(VALUE_REGEXP, 'value')?.trim();

      current[key] = value;
    }
  }

  return ini;
}

parseINI.SECTIONS = SECTIONS;
