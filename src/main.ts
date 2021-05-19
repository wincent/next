/**
 * SPDX-FileCopyrightText: Copyright 2020 Greg Hurrell
 * SPDX-License-Identifier: MIT
 */

import getConfig from './getConfig';
import parseArgs from './parseArgs';
import log from './util/log';
import {confirm} from './util/readline';
import {getWorktrees} from './util/worktree';

import type {Config} from './getConfig';
import type {Invocation} from './parseArgs';

export type Context = {
  config: Config;
  invocation: Invocation;
};

export default async function main(): Promise<void> {
  const invocation = parseArgs(process.argv);

  // TODO: make `next add` work so that I can start dog-fooding this thing
  // TODO: respect rc.repo if present
  const config = getConfig(invocation.options.config || undefined);

  const context = {config, invocation};

  if (invocation.options.help) {
    // TODO: show help and exit
    // if we have a subcommand, show subcommand-specific help
    // offer to show man page with `help subcommand`
    await (
      await import('./subcommands/help')
    ).default({
      config,
      invocation: {
        args: invocation.subcommand
          ? [invocation.subcommand, ...invocation.args]
          : invocation.args,
        options: invocation.options,
        subcommand: 'help',
      },
    });

    process.exit();
  }

  if (config.location === null) {
    // Offer to create rc file?
  } else {
    if (config.worktree) {
      // Make sure it actually is a worktree.
      const expectedBranch = `refs/heads/${config.branch}`;
      const expectedPath = config.dataDirectory;

      // TODO: before this, check that we're in a git repo...
      const worktrees = getWorktrees();

      const worktree = worktrees.find(({branch, path}) => {
        return branch === expectedBranch && path === expectedPath;
      });

      if (!worktree) {
        log.notice(
          `Worktree does not exist for branch "${config.branch}" at path "${config.worktree}"`
        );
        // NOTE: should only offer this if nothing already at config.worktree
        // and branch not already checked out at some other worktree
        if (await confirm('Do you want me to create it?')) {
          // git symbolic-ref HEAD refs/heads/tasks
          // rm .git/index
          // git commit -m 'chore: initialize new branch' --allow-empty
          // git checkout -f master
          // git worktree add tasks tasks
          // console.log('creating...');
          // note may just call `init` for this
        }
      } else {
        // great... it exists, we can proceed...
      }
    } else {
      // Validate dataDirectory exists and is a Git repo.
    }
    // Validate config.branch is checked out.
  }

  switch (invocation.subcommand) {
    case 'add': {
      await (await import('./subcommands/add')).default(context);
      break;
    }

    case 'help': {
      await (await import('./subcommands/help')).default(context);
      break;
    }

    case 'init': {
      await (await import('./subcommands/init')).default(context);
      break;
    }

    case 'ls': {
      await (await import('./subcommands/ls')).default(context);
      break;
    }

    case 'rebuild': {
      await (await import('./subcommands/rebuild')).default(context);
      break;
    }

    case null: {
      // TODO: default list view here
      break;
    }
  }
}
