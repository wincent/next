/**
 * SPDX-FileCopyrightText: Copyright 2020 Greg Hurrell
 * SPDX-License-Identifier: MIT
 */

import StringScanner from './StringScanner';
import git from './git';

type Worktree = {
  bare: boolean;
  branch?: string;
  detached: boolean;
  path: string;
};

export function getWorktrees(): Array<Worktree> {
  // TODO: print useful error message if not in a Git repo
  // (probably do that higher up though)
  const output = git('worktree', 'list', '--porcelain');

  const scanner = new StringScanner(output, '`git worktree list --porcelain`');

  const worktrees = [];

  while (!scanner.atEnd) {
    let bare = false;
    let branch = undefined;
    let detached = false;

    scanner.expect(/worktree /);

    const path = scanner.expect(/[^\n]+\n/).trim();

    while (!scanner.atEnd) {
      if (scanner.scan(/bare\n/)) {
        bare = true;
      }

      if (scanner.scan(/detached\n/)) {
        detached = true;
      }

      const label = scanner.scan(/[^ ]+ /)?.trim();

      if (label) {
        const value = scanner.expect(/[^\n]+\n/).trim();

        if (label === 'branch') {
          branch = value;
        }
      }

      if (scanner.scan(/\n/)) {
        break;
      }
    }

    worktrees.push({
      bare,
      branch,
      detached,
      path,
    });
  }

  return worktrees;
}
