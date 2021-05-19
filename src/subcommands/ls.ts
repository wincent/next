/**
 * SPDX-FileCopyrightText: Copyright 2021 Greg Hurrell
 * SPDX-License-Identifier: MIT
 */

import Store from '../Store';

import log from '../util/log';

import type {Context} from '../main';

export default function ls({config, invocation}: Context): void {
  const store = new Store(config);

  // console.log(store.areas);
  // console.log(store.projects);

  log(`Added: ${'hi'}`);
}

export const description = 'List matching tasks, projects, areas, or tags';

export const help = `
  TODO: long-form help will go here.

  not quite as long as a full man page; to see that you would do \`next help add\`
`;

export const options = {};
