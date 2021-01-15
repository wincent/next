/**
 * SPDX-FileCopyrightText: Copyright 2021 Greg Hurrell
 * SPDX-License-Identifier: MIT
 */

import fs from 'fs';
import path from 'path';

import Store from '../Store';
import log, {bold} from '../util/log';
import {choose, confirm, prompt} from '../util/readline';

import type {Context} from '../main';

export default async function init({
  config,
  invocation,
}: Context): Promise<void> {
  if (invocation.options.config) {
    log.info(
      `Using config file (${config.location}) specified on command line`
    );
  } else if (config.location === path.resolve('.nextrc')) {
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
      [
        '',
        bold(`Select a mode.`),
        '',
        `- "worktree": use \`next\` for task management in an existing project;`,
        `  task data will be stored on a separate branch, and a copy of the`,
        `  branch will be checked out using \`git-worktree\` for easy access.`,
        '',
        `- "standalone": use \`next\` with a dedicated repo of its own;`,
        `  this is useful for managing tasks that span across multiple projects.`,
        '',
      ].forEach((line) => log(line));
      const choice = await choose(
        'Mode',
        ['worktree', 'standalone'],
        'worktree'
      );
      const branch = await prompt(
        'Branch name?',
        choice === 'standalone' ? 'master' : 'tasks'
      );
      const remote = await prompt('Remote name?', 'origin');
      const repo =
        choice === 'standalone' ? await prompt('Repository path?', '.') : '.';
      const worktree =
        choice === 'standalone'
          ? null
          : await prompt('Worktree path?', 'tasks');

      const ini = Object.entries({branch, remote, repo, worktree}).reduce(
        (output, [key, value]) => {
          return value ? output + `${key} = ${value}\n` : output;
        },
        ''
      );

      fs.writeFileSync('.nextrc', ini, 'utf8');
      log.info(`Wrote ${ini.length} bytes to .nextrc`);
    }
  }

  // TODO check before creating inbox file
  const store = new Store(config);
  store.addProject('Inbox');
  log.info(`Created project: Inbox`); // TODO: dump path here?
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
