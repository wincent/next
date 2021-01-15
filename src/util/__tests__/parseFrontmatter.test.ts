/**
 * SPDX-FileCopyrightText: Copyright 2021 Greg Hurrell
 * SPDX-License-Identifier: MIT
 */

import parseFrontmatter from '../parseFrontmatter';

describe('parseFrontmatter()', () => {
  it('handles missing frontmatter', () => {
    expect(parseFrontmatter('yo dawg')).toEqual({
      content: 'yo dawg',
      metadata: {},
    });
  });

  it('handles empty frontmatter', () => {
    expect(
      parseFrontmatter('---\n' + '---\n' + '\n' + 'some content\n')
    ).toEqual({
      content: 'some content\n',
      metadata: {},
    });
  });

  it('handles frontmatter with one key-value pair', () => {
    expect(
      parseFrontmatter(
        '---\n' +
          'uuid: b996c5f6-034c-482e-868b-db3ec15a9b92\n' +
          '---\n' +
          '\n' +
          'words\n' +
          'and more words\n'
      )
    ).toEqual({
      content: 'words\n' + 'and more words\n',
      metadata: {uuid: 'b996c5f6-034c-482e-868b-db3ec15a9b92'},
    });
  });

  it('handles frontmatter with multiple key-value pairs', () => {
    expect(
      parseFrontmatter(
        '---\n' +
          '   foo : bar  \n' +
          'baz: 9000\n' +
          '---\n' +
          '\n' +
          'contents\n'
      )
    ).toEqual({
      content: 'contents\n',
      metadata: {foo: 'bar', baz: '9000'},
    });
  });
});
