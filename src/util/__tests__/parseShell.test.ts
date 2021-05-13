/**
 * SPDX-FileCopyrightText: Copyright 2021 Greg Hurrell
 * SPDX-License-Identifier: MIT
 */

import parseShell from '../parseShell';

describe('parseShell()', () => {
  it('parses an empty string', () => {
    expect(parseShell('')).toEqual(['']);
  });

  it('parses a blank string', () => {
    expect(parseShell('\t\t\t   ')).toEqual(['']);
  });

  it('parses a plain command', () => {
    expect(parseShell('ls')).toEqual(['ls']);
    expect(parseShell('  ls\t')).toEqual(['ls']);
  });

  it('parses a command with a single argument', () => {
    expect(parseShell('ls /etc')).toEqual(['ls', '/etc']);
    expect(parseShell('  ls\t\t/etc   ')).toEqual(['ls', '/etc']);
  });

  it('parses a command with multiple arguments', () => {
    expect(parseShell('touch foo bar baz')).toEqual([
      'touch',
      'foo',
      'bar',
      'baz',
    ]);
    expect(parseShell('\ttouch   foo   bar\tbaz\t')).toEqual([
      'touch',
      'foo',
      'bar',
      'baz',
    ]);
  });

  it('parses a command with a double-quoted argument', () => {
    expect(parseShell('echo "hi"')).toEqual(['echo', 'hi']);
    expect(parseShell('touch "foo bar baz"')).toEqual(['touch', 'foo bar baz']);
    expect(parseShell('echo    "hi"')).toEqual(['echo', 'hi']);
    expect(parseShell('touch\t\t"foo bar baz"  ')).toEqual([
      'touch',
      'foo bar baz',
    ]);

    // We can backslash escape things.
    expect(parseShell('echo "Name: \\$USER"')).toEqual(['echo', 'Name: $USER']);

    // Backslash is passed through if it is not followed by something escapable.
    expect(parseShell('echo "Name: \\abc"')).toEqual(['echo', 'Name: \\abc']);

    // We don't expand this kind of thing, we just pass it through.
    expect(parseShell('echo "hello $USER"')).toEqual(['echo', 'hello $USER']);
    expect(parseShell('echo "now `date`"')).toEqual(['echo', 'now `date`']);
  });

  it('parses a command with a single-quoted argument', () => {
    expect(parseShell("echo 'hi'")).toEqual(['echo', 'hi']);
    expect(parseShell("touch 'foo bar baz'")).toEqual(['touch', 'foo bar baz']);
    expect(parseShell("echo\t'hi'")).toEqual(['echo', 'hi']);
    expect(parseShell("  touch   'foo bar baz'   ")).toEqual([
      'touch',
      'foo bar baz',
    ]);

    // Note that everything inside single quotes is interpreted literally,
    // except for single quotes.
    expect(parseShell("echo 'foo\\nbar $var'")).toEqual([
      'echo',
      'foo\\nbar $var',
    ]);

    // Typical example: "escaping" a single-quote in a single-quoted string by
    // ending the sting.
    expect(parseShell("echo 'don'\\''t try this at home'")).toEqual([
      'echo',
      "don't try this at home",
    ]);
  });

  it('can glue together adjacent quoted strings', () => {
    expect(parseShell(`echo first 'second '"arg here"`)).toEqual([
      'echo',
      'first',
      'second arg here',
    ]);
  });

  it('parses a command with backslash escapes', () => {
    expect(parseShell("echo don\\'t worry")).toEqual([
      'echo',
      "don't",
      'worry',
    ]);
    expect(parseShell("\techo   don\\'t   worry")).toEqual([
      'echo',
      "don't",
      'worry',
    ]);
  });

  it('ignores a command which contains only a comment', () => {
    expect(parseShell('# TODO')).toEqual(['']);
  });

  it('ignores trailing comments', () => {
    expect(parseShell('echo hi # TODO')).toEqual(['echo', 'hi']);
  });

  it('complains about unterminated escapes', () => {
    expect(() => parseShell('echo bad egg\\')).toThrow(/unterminated escape/);
  });

  it('complains about unterminated double-quoted strings', () => {
    expect(() => parseShell('echo say "hello')).toThrow(
      /unterminated double-quoted/
    );
  });

  it('complains about unterminated single-quoted strings', () => {
    expect(() => parseShell("echo don't try this")).toThrow(
      /unterminated single-quoted/
    );
  });
});
