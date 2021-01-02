/**
 * SPDX-FileCopyrightText: Copyright 2021 Greg Hurrell
 * SPDX-License-Identifier: MIT
 */

import type {Invocation} from '../parseArgs';

export default function add({args, options}: Invocation): void {
  console.log('adding', args, options);
}

export const description = 'Add a new task';

export const help = `
  TODO: long-form help will go here.

  not quite as long as a full man page; to see that you would do \`next help add\`
`;

export const options = {
  '-v': {
    description: 'visual mode (using $EDITOR)',
    type: 'boolean',
  },
};
