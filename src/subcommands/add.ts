/**
 * SPDX-FileCopyrightText: Copyright 2021 Greg Hurrell
 * SPDX-License-Identifier: MIT
 */

import Store from '../Store';

import log from '../util/log';

import type {Context} from '../main';

export default function add({config, invocation}: Context): void {
  console.log('adding', config, invocation);

  const store = new Store(config);

  const added = store.addTask(invocation.args.join(' '));

  log(`Added: ${added.uuid}`);
}

export const description = 'Add a new task';

export const help = `
  TODO: long-form help will go here.

  not quite as long as a full man page; to see that you would do \`next help add\`
`;

export const options = {
  '-v': {
    // TODO: actually implement this
    description: 'visual mode (using $EDITOR)',
    type: 'boolean',
  },
};
