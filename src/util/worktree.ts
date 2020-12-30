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

    scan(/worktree /, scanner);

    const path = scan(/[^\n]+\n/, scanner).trim();

    while (!scanner.atEnd) {
      if (optional(/bare\n/, scanner)) {
        bare = true;
      }

      if (optional(/detached\n/, scanner)) {
        detached = true;
      }

      const label = optional(/[^ ]+ /, scanner)?.trim();

      if (label) {
        const value = scan(/[^\n]+\n/, scanner).trim();

        if (label === 'branch') {
          branch = value;
        }
      }

      if (optional(/\n/, scanner)) {
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

function optional(pattern: RegExp, scanner: StringScanner): string | null {
  return scanner.scan(pattern);
}

function scan(pattern: RegExp, scanner: StringScanner): string {
  const result = scanner.scan(pattern);

  if (!result) {
    const [line, column] = scanner.location;

    throw new Error(
      `Expected ${pattern} at line ${line}, column ${column} of ${scanner.description}:\n\n` +
        scanner.context(line, column)
    );
  }

  return result;
}
