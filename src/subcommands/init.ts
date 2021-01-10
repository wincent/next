/**
 * SPDX-FileCopyrightText: Copyright 2021 Greg Hurrell
 * SPDX-License-Identifier: MIT
 */

import path from 'path';

import log from '../util/log';
import {choose, confirm, prompt} from '../util/readline';

import type {Context} from '../main';

export default async function init({
  config,
  invocation,
}: Context): Promise<void> {
  if (config.location === path.resolve('.nextrc')) {
    log.info(
      `Config file (${config.location}) found in current working directory`
    );
  } else {
    if (config.location === null) {
      log.info('No config file found');
    } else {
      log.info(`Config file (${config.location}) found in ancestor directory`);
    }
    if (await confirm('Create .nextrc config file in current directory?')) {
      // TODO make these questions actually make sense...
      // need to ask first whether you want to add tasks to an existing project
      // (ie. use a worktree)
      // or to make a standalone task store
      const choice = await choose(
        'Mode',
        ['worktree', 'standalone'],
        'worktree'
      );
      const branch = await prompt('Branch name?', 'master');
      const dataDirectory = await prompt('Data directory?', '.');
      const repo = await prompt('Repository?', '.');
      const worktree = await prompt('Worktree?');
    }
  }

  // create inbox?
  //
}

export const description = 'Initialize a project';

export const help = `
  Initializes a project by creating a .nextrc file and setting up the
  corresponding data directory.
`;

export const options = {
  '-y': {
    // TODO: actually implement a -y option to do everything without interactive promps
    description: 'non-interactive mode (use defaults)',
    type: 'boolean',
  },
};
