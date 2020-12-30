/**
 * SPDX-FileCopyrightText: Copyright 2020 Greg Hurrell
 * SPDX-License-Identifier: MIT
 */

import StringScanner from './StringScanner';
import git from './git';

type Worktree = {
  // TODO: note that we might not need this one; might remove it later
  HEAD: string;
  // TODO: inspect what git-worktree returns for detached heads
  branch: string;
  path: string;
};

export function getWorktrees(): Array<Worktree> {
  const output = git('worktree', 'list', '--porcelain');

  const scanner = new StringScanner(output, '`git worktree list --porcelain`');

  const worktrees = [];

  while (!scanner.atEnd) {
    // TODO: see `man git-worktree` for details of porcelain format
    // (we still need to handle some optional fields like "bare" and "detached",
    // and might want to future-proof for the additional of additional possible
    // fields in the future)
    scan(/worktree\s+/, scanner);

    const worktreePath = scan(/[^\n]+\n/, scanner).trim();

    scan(/HEAD\s+/, scanner);

    const head = scan(/[a-f0-9]{40}\n/, scanner);

    scan(/branch\s+/, scanner);

    const branch = scan(/[^\n]+\n/, scanner).trim();

    scan(/\s+/, scanner);

    worktrees.push({
      HEAD: head,
      branch,
      path: worktreePath,
    });
  }

  return worktrees;
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
