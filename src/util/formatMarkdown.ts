/**
 * SPDX-FileCopyrightText: Copyright 2021 Greg Hurrell
 * SPDX-License-Identifier: MIT
 */

import StringScanner from './StringScanner';

const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';
const YELLOW = '\x1b[33m';

/**
 * Assumes "well-formed" input (for example, assumes no "weirdness" like
 * consecutive headings and os on).
 */
export default function formatMarkdown(markdown: string): string {
  const scanner = new StringScanner(markdown);

  let output = '';

  while (!scanner.atEnd) {
    const heading = scanner.scan(/# [^\n]+\n?/);

    const prefix = process.stdout.isTTY ? `${BOLD}${YELLOW}` : '';

    const suffix = process.stdout.isTTY ? RESET : '';

    if (heading) {
      output += `${prefix}${heading.slice(2).toUpperCase()}${suffix}`;
    }

    if (scanner.peek(/> /)) {
      const blockquote = [];

      while (!scanner.atEnd) {
        const line = scanner.scan(/> [^\n]+\n?/);

        if (line === null) {
          break;
        }

        blockquote.push(line.slice(2).trim());
      }

      const paragraph = wrap(blockquote.join(' '), 4);

      output += paragraph + '\n';
    }

    if (scanner.peek(/ {4}/)) {
      const pre = [];

      while (!scanner.atEnd) {
        const line = scanner.scan(/ {4}[^\n]*\n?/);

        if (line === null) {
          break;
        }

        pre.push(line);
      }

      output += pre.join('');
    }

    const item = scanner.scan(/- [^\n]*\n?/);

    if (item !== null) {
      output += '- ' + wrap(item.slice(2), 2).slice(2);

      while (scanner.peek(/\n {2}/)) {
        // List item continues.
        const item = scanner.scan(/\n {2}[^\n]*\n?/);

        if (item !== null) {
          output += '\n  ' + wrap(item.slice(3), 2).slice(2);
        }
      }
    }

    const other = scanner.scan(/[^\n]*\n?/);

    if (other !== null) {
      output += wrap(other);
    } else {
      // Panic!
      output += wrap(scanner.remaining);
      break;
    }
  }

  return output;
}

function wrap(input: string, indent = 0): string {
  const limit = 80 - indent;

  let output = '';

  const words = input.split(/[ \t]+/);

  let width = 0;

  for (const word of words) {
    if (!width || width + word.length < limit) {
      if (width) {
        output += ` ${word}`;
        width += word.length + 1;
      } else {
        output += `${' '.repeat(indent)}${word}`;
        width += word.length;
      }
    } else {
      output += `\n${' '.repeat(indent)}${word}`;
      width = word.length;
    }
  }

  return output;
}
