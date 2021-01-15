/**
 * SPDX-FileCopyrightText: Copyright 2021 Greg Hurrell
 * SPDX-License-Identifier: MIT
 */

import StringScanner from './StringScanner';

const FRONTMATTER_DELIMITER_REGEXP = /---(?:\r?\n|$)/;
const KEY_REGEXP = /[ \t]*[^ \t:]+[ \t]*:[ \t]*/;
const VALUE_REGEXP = /[^\r\n]+(?:\r?\n|$)/;

export default function parseFrontmatter(
  input: string,
  description?: string
): {
  content: string;
  metadata: {
    [key: string]: string;
  };
} {
  const metadata: {[key: string]: string} = {};
  const scanner = new StringScanner(input, description);

  if (scanner.scan(FRONTMATTER_DELIMITER_REGEXP)) {
    while (scanner.peek(KEY_REGEXP)) {
      const key = scanner.expect(KEY_REGEXP).split(':')[0].trim();
      const value = scanner.expect(VALUE_REGEXP, 'value').trim();

      metadata[key] = value;
    }

    scanner.expect(FRONTMATTER_DELIMITER_REGEXP, '---');
  }

  const content = scanner.expect(/.*/s).trimLeft();

  return {
    content,
    metadata,
  };
}
