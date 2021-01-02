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
          config: false,
          global: false,
          help: false,
        },
        subcommand: null,
      });
    });

    it('groks the -g/--global switches', () => {
      expect(parseArgs([node, script, '-g'])).toEqual({
        args: [],
        options: {
          config: false,
          global: true,
          help: false,
        },
        subcommand: null,
      });

      expect(parseArgs([node, script, '--global'])).toEqual({
        args: [],
        options: {
          config: false,
          global: true,
          help: false,
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
          help: false,
        },
        subcommand: null,
      });

      expect(parseArgs([node, script, '--config', 'some-file'])).toEqual({
        args: [],
        options: {
          config: 'some-file',
          global: false,
          help: false,
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
          help: false,
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
          help: false,
        },
        subcommand: null,
      });
    });

    it('complains about unrecognized switches', () => {
      expect(() => parseArgs([node, script, '--sudo'])).toThrow(
        'unrecognized option: --sudo'
      );
    });

    it('groks the -h/--help switches', () => {
      expect(parseArgs([node, script, '-h'])).toEqual({
        args: [],
        options: {
          config: false,
          global: false,
          help: true,
        },
        subcommand: null,
      });

      expect(parseArgs([node, script, '--help'])).toEqual({
        args: [],
        options: {
          config: false,
          global: false,
          help: true,
        },
        subcommand: null,
      });
    });

    it('returns immediately as soon as it sees -h or --help', () => {
      // ie. it ignores subsequent invalid options
      expect(parseArgs([node, script, 'add', '--help', '--garbage'])).toEqual({
        args: [],
        options: {
          config: false,
          global: false,
          help: true,
        },
        subcommand: 'add',
      });
    });
  });

  describe('with a subcommand', () => {
    it('identifies the subcommand', () => {
      expect(parseArgs([node, script, 'add'])).toEqual({
        args: [],
        options: {
          config: false,
          global: false,
          help: false,
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
          config: false,
          global: true,
          help: false,
        },
        subcommand: 'add',
      });

      // After the subcommand.
      expect(parseArgs([node, script, 'add', '--global'])).toEqual({
        args: [],
        options: {
          config: false,
          global: true,
          help: false,
        },
        subcommand: 'add',
      });
    });

    it('accepts switches specific to a subcommand', () => {
      expect(parseArgs([node, script, 'add', '-v'])).toEqual({
        args: [],
        options: {
          '-v': true,
          config: false,
          global: false,
          help: false,
        },
        subcommand: 'add',
      });
    });

    it('extracts trailing arguments', () => {
      expect(parseArgs([node, script, 'add', 'buy', 'milk'])).toEqual({
        args: ['buy', 'milk'],
        options: {
          config: false,
          global: false,
          help: false,
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
          help: false,
        },
        subcommand: 'add',
      });
    });
  });
});
