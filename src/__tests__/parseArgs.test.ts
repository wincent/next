/**
 * SPDX-FileCopyrightText: Copyright 2020 Greg Hurrell
 * SPDX-License-Identifier: MIT
 */

import parseArgs from '../parseArgs';

describe('parseArgs()', () => {
  const node = '/usr/bin/node';
  const script = '/some/path/to/bin/next';

  describe('with no subcommand', () => {
    it('handles an empty arguments list', () => {
      expect(parseArgs([node, script])).toEqual({
        args: [],
        options: {
          config: undefined,
          global: false,
        },
        subcommand: null,
      });
    });

    it('groks the -g/--global switches', () => {
      expect(parseArgs([node, script, '-g'])).toEqual({
        args: [],
        options: {
          config: undefined,
          global: true,
        },
        subcommand: null,
      });

      expect(parseArgs([node, script, '--global'])).toEqual({
        args: [],
        options: {
          config: undefined,
          global: true,
        },
        subcommand: null,
      });
    });

    it('groks the -c/--config switches', () => {
      expect(parseArgs([node, script, '-c', 'some-file'])).toEqual({
        args: [],
        options: {
          config: 'some-file',
          global: false,
        },
        subcommand: null,
      });

      expect(parseArgs([node, script, '--config', 'some-file'])).toEqual({
        args: [],
        options: {
          config: 'some-file',
          global: false,
        },
        subcommand: null,
      });
    });

    it('expects a config file name with the -c/--config switches', () => {
      expect(() => parseArgs([node, script, '-c'])).toThrow(
        '-c/--config requires a filename argument'
      );

      expect(() => parseArgs([node, script, '--config'])).toThrow(
        '-c/--config requires a filename argument'
      );
    });

    it('uses the last-passed value when there are redundant switches', () => {
      expect(parseArgs([node, script, '-c', 'a', '--config', 'b'])).toEqual({
        args: [],
        options: {
          config: 'b',
          global: false,
        },
        subcommand: null,
      });
    });

    it('accepts combinations of switches', () => {
      expect(parseArgs([node, script, '-g', '-c', 'some-file'])).toEqual({
        args: [],
        options: {
          config: 'some-file',
          global: true,
        },
        subcommand: null,
      });
    });

    it('complains about unrecognized switches', () => {
      expect(() => parseArgs([node, script, '--sudo'])).toThrow(
        'unrecognized option: --sudo'
      );
    });
  });

  describe('with a subcommand', () => {
    it('identifies the subcommand', () => {
      expect(parseArgs([node, script, 'add'])).toEqual({
        args: [],
        options: {
          config: undefined,
          global: false,
        },
        subcommand: 'add',
      });
    });

    it('complains about unknown subcommands', () => {
      expect(() => parseArgs([node, script, 'crap'])).toThrow(
        'unrecognized subcommand: crap'
      );
    });

    it('complains about unrecognized switches', () => {
      expect(() => parseArgs([node, script, 'add', '--sudo'])).toThrow(
        'unrecognized option: --sudo'
      );
    });

    it('accepts other switches in combination with subcommands', () => {
      // Before the subcommand.
      expect(parseArgs([node, script, '-g', 'add'])).toEqual({
        args: [],
        options: {
          config: undefined,
          global: true,
        },
        subcommand: 'add',
      });

      // After the subcommand.
      expect(parseArgs([node, script, 'add', '--global'])).toEqual({
        args: [],
        options: {
          config: undefined,
          global: true,
        },
        subcommand: 'add',
      });
    });

    it('extracts trailing arguments', () => {
      expect(parseArgs([node, script, 'add', 'buy', 'milk'])).toEqual({
        args: ['buy', 'milk'],
        options: {
          config: undefined,
          global: false,
        },
        subcommand: 'add',
      });
    });

    it('treats everything after "--" literally', () => {
      expect(
        parseArgs([
          node,
          script,
          'add',
          '-c',
          'conf',
          'buy',
          'milk',
          '--',
          '--global',
        ])
      ).toEqual({
        args: ['buy', 'milk', '--global'],
        options: {
          config: 'conf',
          global: false,
        },
        subcommand: 'add',
      });
    });
  });
});
