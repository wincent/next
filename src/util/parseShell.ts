/**
 * SPDX-FileCopyrightText: Copyright 2021 Greg Hurrell
 * SPDX-License-Identifier: MIT
 */

import StringScanner from './StringScanner';

/**
 * Simplistic parsing of shell command syntax into an executable name plus
 * a variable number of arguments. Comments (text following a "#" are ignored).
 *
 * NOTE: This is not intended to be robust; it's just enough to allow us to
 * write shell commands in our integration tests in a simple format.
 *
 * The most concise and intelligible summary of shell quoting and escaping rules
 * that I've found follows:
 *
 * > - A backslash (\) protects the next character, except if it is a newline.
 * >   If a backslash precedes a newline, it prevents the newline from being
 * >   interpreted as a command separator, but the backslash-newline pair
 * >   disappears completely.
 * >
 * > - Single quotes ('...') protect everything (even backslashes, newlines,
 * >   etc.) except single quotes, until the next single quote.
 * >
 * > - Double quotes ("...") protect everything except double quotes,
 * >   backslashes, dollar signs, and backquotes, until the next double quote.
 * >   A backslash can be used to protect ", \, $, or ` within double quotes.
 * >   A backslash-newline pair disappears completely; a backslash that does not
 * >   precede ", \, $, `, or newline is taken literally.
 *
 * @see https://rg1-teaching.mpi-inf.mpg.de/unixffb-ss98/quoting-guide.html
 */
export default function parseShell(
  input: string
): [executable: string, ...args: Array<string>] {
  const scanner = new StringScanner(input);

  const whitespace = () => scanner.scan(/\s+/);

  const word = () => {
    let mode: 'unquoted' | 'singleQuoted' | 'doubleQuoted' = 'unquoted';
    let word = '';

    while (!scanner.atEnd) {
      if (mode === 'unquoted') {
        if (scanner.scan(/#.*/)) {
          break;
        } else if (scanner.scan(/\\/)) {
          const next = scanner.scan(/./);
          if (next) {
            word += next;
          } else {
            throw new Error(`parseShell(): unterminated escape`);
          }
        } else if (scanner.scan(/"/)) {
          mode = 'doubleQuoted';
        } else if (scanner.scan(/'/)) {
          mode = 'singleQuoted';
        } else if (scanner.scan(/\s+|$/)) {
          break;
        } else {
          word += scanner.scan(/./);
        }
      } else if (mode === 'doubleQuoted') {
        if (scanner.scan(/"/)) {
          mode = 'unquoted';
        } else if (scanner.scan(/\\/)) {
          const next = scanner.scan(/["\\$`]/);
          if (next) {
            word += next;
          } else {
            word += '\\';
          }
        } else {
          const next = scanner.scan(/./);

          // We don't even pretend to expand "`" or "$", for obvious reasons
          // (we're not an actual shell); we just pass it through, along with
          // all the rest.
          if (next) {
            word += next;
          }
        }
      } else if (mode === 'singleQuoted') {
        if (scanner.scan(/'/)) {
          mode = 'unquoted';
        } else {
          const next = scanner.scan(/./);
          if (next) {
            word += next;
          }
        }
      }
    }

    if (mode === 'singleQuoted') {
      throw new Error(`parseShell(): unterminated single-quoted string`);
    } else if (mode === 'doubleQuoted') {
      throw new Error(`parseShell(): unterminated double-quoted string`);
    }

    // Slurp trailing whitespace and comment.
    scanner.scan(/\s*(?:#.*)?/);

    return word;
  };

  whitespace();

  const executable = word();

  const args: Array<string> = [];

  while (!scanner.atEnd) {
    args.push(word());
  }

  return [executable, ...args];
}
