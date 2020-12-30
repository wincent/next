/**
 * SPDX-FileCopyrightText: Copyright 2020 Greg Hurrell
 * SPDX-License-Identifier: MIT
 */

import getConfig from './getConfig';
import log from './util/log';
import prompt from './util/prompt';
import {getWorktrees} from './util/worktree';

export default async function main(): Promise<void> {
  // TODO: make subcommands work...
  // TODO: make `next add` work so that I can start dog-fooding this thing
  // TODO: respect rc.repo if present
  const config = getConfig();

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
        if (prompt('Do you want me to create it? [y/n]')) {
          console.log('creating...');
        }
      } else {
        // great... it exists, we can proceed...
      }
    } else {
      // Validate dataDirectory exists and is a Git repo.
    }
    // Validate config.branch is checked out.
  }
}
