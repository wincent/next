/**
 * SPDX-FileCopyrightText: Copyright 2021 Greg Hurrell
 * SPDX-License-Identifier: MIT
 */

import formatMarkdown from '../formatMarkdown';

describe('formatMarkdown()', () => {
  describe('outside a TTY', () => {
    let isTTY: boolean;

    beforeEach(() => {
      isTTY = process.stdout.isTTY;

      process.stdout.isTTY = false;
    });

    afterEach(() => {
      process.stdout.isTTY = isTTY;
    });

    it('returns simple input without changes', () => {
      expect(formatMarkdown('Hi!')).toBe('Hi!');
    });

    it('capitalizes headings', () => {
      expect(formatMarkdown('# Name')).toBe('NAME');
    });

    it('indents block quotes', () => {
      expect(
        formatMarkdown(
          'Some text\n' +
            '\n' +
            '> Some more text. This one is going to be indented and\n' +
            '> wrapped. Foo bar baz. Lorem ipsum ipso facto quid pro\n' +
            '> quo. Covfefe.'
        )
      ).toBe(
        'Some text\n' +
          '\n' +
          '    Some more text. This one is going to be indented and wrapped. Foo bar baz.\n' +
          '    Lorem ipsum ipso facto quid pro quo. Covfefe.\n'
      );
    });

    it('indents code blocks', () => {
      expect(
        formatMarkdown(
          'Yo\n' +
            '\n' +
            '    pre-formatted\n' +
            '      code-block\n' +
            '\n' +
            'normal text'
        )
      ).toBe(
        'Yo\n' +
          '\n' +
          '    pre-formatted\n' +
          '      code-block\n' +
          '\n' +
          'normal text'
      );
    });

    it('formats lists', () => {
      expect(
        formatMarkdown(
          'normal text\n' +
            '\n' +
            '- a list item with lots of text that will wrap onto more than one line because it is too long\n' +
            '- a more modest list item\n' +
            '- a list item which has some nested content\n' +
            '\n' +
            '  note the two leading spaces. this belongs to the list item above.\n' +
            '\n' +
            '  as does this long line here, which is long enough that it will be wrapped onto multiple lines\n' +
            '\n' +
            'normal text again'
        )
      ).toBe(
        'normal text\n' +
          '\n' +
          '- a list item with lots of text that will wrap onto more than one line because\n' +
          '  it is too long\n' +
          '- a more modest list item\n' +
          '- a list item which has some nested content\n' +
          '\n' +
          '  note the two leading spaces. this belongs to the list item above.\n' +
          '\n' +
          '  as does this long line here, which is long enough that it will be wrapped onto\n' +
          '  multiple lines\n' +
          '\n' +
          'normal text again'
      );
    });

    it('wraps long paragraphs', () => {
      expect(formatMarkdown('many words '.repeat(15).trim())).toBe(
        'many words many words many words many words many words many words many words\n' +
          'many words many words many words many words many words many words many words\n' +
          'many words'
      );
    });

    it('does not wrap long headings', () => {
      // Really, it's bad form to write long headings anyway.
      expect(formatMarkdown(`# ${'too long '.repeat(10).trim()} heading`)).toBe(
        'TOO LONG TOO LONG TOO LONG TOO LONG TOO LONG TOO LONG TOO LONG TOO LONG TOO LONG TOO LONG HEADING'
      );
    });
  });

  describe('in a TTY', () => {
    let isTTY: boolean;

    beforeEach(() => {
      isTTY = process.stdout.isTTY;

      process.stdout.isTTY = true;
    });

    afterEach(() => {
      process.stdout.isTTY = isTTY;
    });

    it('styles headings as bold orange', () => {
      expect(formatMarkdown('# Heading')).toBe('\x1b[1m\x1b[33mHEADING\x1b[0m');
    });
  });
});
