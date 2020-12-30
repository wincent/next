/**
 * SPDX-FileCopyrightText: Copyright 2020 Greg Hurrell
 * SPDX-License-Identifier: MIT
 */

import path from 'path';

import loadRC from './util/loadRC';
import log from './util/log';
import prompt from './util/prompt';
import {getWorktrees} from './util/worktree';

export default async function main(): Promise<void> {
  // TODO: make subcommands work...
  // TODO: respect rc.repo if present
  const rc = loadRC();

  if (rc) {
    if (rc.worktree && rc.branch) {
      const expectedBranch = `refs/heads/${rc.branch}`;
      const expectedPath = path.join(process.cwd(), rc.worktree);

      // TODO: before this, check that we're in a git repo...
      const worktrees = getWorktrees();

      const worktree = worktrees.find(({branch, path}) => {
        return branch === expectedBranch && path === expectedPath;
      });

      if (!worktree) {
        log.notice(
          `Worktree does not exist for branch "${rc.branch}" at path "${rc.worktree}"`
        );
        if (prompt('Do you want me to create it? [y/n]')) {
          console.log('creating...');
        }
      } else {
        // great... it exists, we can proceed...
      }
    }
  } else {
    // TODO: offer to create it
  }
}
