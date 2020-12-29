/**
 * SPDX-FileCopyrightText: Copyright 2020 Greg Hurrell
 * SPDX-License-Identifier: MIT
 */

import StringScanner, {toAnchoredRegExp} from '../StringScanner';

describe('StringScanner', () => {
  describe('context()', () => {
    let scanner: StringScanner;

    beforeEach(() => {
      const sample = [
        'first line',
        'second line',
        'third line',
        'fourth line',
        'fifth line',
        'sixth line',
        'seventh line',
      ].join('\n');

      scanner = new StringScanner(sample);
    });

    it('shows nothing for an empty haystack', () => {
      const scanner = new StringScanner('');

      expect(scanner.context(1, 1)).toBe('');
    });

    it('shows context at the start of the haystack', () => {
      expect(scanner.context(1, 1)).toBe(
        '> 1 | first line\n' +
          '    | ^\n' +
          '  2 | second line\n' +
          '  3 | third line\n' +
          '  4 | fourth line\n'
      );
    });

    it('shows context on the first line', () => {
      expect(scanner.context(1, 5)).toBe(
        '> 1 | first line\n' +
          '    |     ^\n' +
          '  2 | second line\n' +
          '  3 | third line\n' +
          '  4 | fourth line\n'
      );
    });

    it('shows context on the last line', () => {
      expect(scanner.context(7, 5)).toBe(
        '  5 | fifth line\n' +
          '  6 | sixth line\n' +
          '> 7 | seventh line\n' +
          '    |     ^\n'
      );
    });

    it('shows context in the middle', () => {
      expect(scanner.context(4, 5)).toBe(
        '  2 | second line\n' +
          '  3 | third line\n' +
          '> 4 | fourth line\n' +
          '    |     ^\n' +
          '  5 | fifth line\n' +
          '  6 | sixth line\n' +
          '  7 | seventh line\n'
      );
    });
  });

  describe('scan()', () => {
    it('scans regular expressions', () => {
      const scanner = new StringScanner('over 9000');

      expect(scanner.scan(/\w+/)).toBe('over');
      expect(scanner.scan(/\s+/)).toBe(' ');
      expect(scanner.scan(/\d+/)).toBe('9000');
    });

    it('returns null when there is no match', () => {
      const scanner = new StringScanner('something');

      expect(scanner.scan(/foo/)).toBe(null);
    });
  });

  describe('atEnd', () => {
    it('is always already at the end of an empty string', () => {
      const scanner = new StringScanner('');

      expect(scanner.atEnd).toBe(true);
    });

    it('does not start at the end of a non-empty string', () => {
      const scanner = new StringScanner('contents');

      expect(scanner.atEnd).toBe(false);
    });

    it('arrives at the end of a non-empty string after scanning it all', () => {
      const scanner = new StringScanner('stuff');

      scanner.scan(/.+/);

      expect(scanner.atEnd).toBe(true);
    });
  });

  describe('index', () => {
    it('is zero before scanning starts', () => {
      expect(new StringScanner('hey').index).toBe(0);
    });

    it('reflects the portion of the string scanned so far', () => {
      const scanner = new StringScanner('stuff here');

      scanner.scan(/\w+/);

      expect(scanner.index).toBe(5);

      scanner.scan(/.+/);

      expect(scanner.index).toBe(10);
    });
  });

  describe('location', () => {
    it('is [1, 1] before scanning starts', () => {
      const scanner = new StringScanner('hey');

      expect(scanner.location).toEqual([1, 1]);
    });

    it('increments the column number as text is scanned', () => {
      const scanner = new StringScanner('stuff here');

      scanner.scan(/\w+/);

      expect(scanner.location).toEqual([1, 6]);
    });

    it('increments the line number as text is scanned', () => {
      const scanner = new StringScanner('food\nfight');

      scanner.scan(/food\n/);
      scanner.scan(/../);

      expect(scanner.location).toEqual([2, 3]);
    });
  });
});

describe('toAnchoredRegExp()', () => {
  it('turns a non-anchored RegExp into an anchored one', () => {
    const anchored = toAnchoredRegExp(/stuff/);

    expect(anchored.source).toBe('^stuff');
  });

  it('preserves flags', () => {
    const anchored = toAnchoredRegExp(/stuff/gi);

    expect(anchored.flags).toBe('gi');
  });

  it('leaves an already-anchored RegExp unchanged', () => {
    const regExp = /^stuff/;

    expect(toAnchoredRegExp(regExp)).toBe(regExp);
  });
});
