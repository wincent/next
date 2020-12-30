/**
 * SPDX-FileCopyrightText: Copyright 2020 Greg Hurrell
 * SPDX-License-Identifier: MIT
 */

import os from 'os';
import path from 'path';

import loadRC from './util/loadRC';

type Config = {
  // Properties from INI.
  branch: string;
  repo: string;
  worktree: string | null;
} & {
  // Synthetic properties
  dataDirectory: string;
  location: string | null;
};

const PLACEHOLDER = '«placeholder»';

export default function getConfig(): Config {
  const rc = loadRC();

  const config: Config = {
    branch: rc.branch || 'master',
    dataDirectory: PLACEHOLDER,
    location: rc[loadRC.LOCATION],
    repo: PLACEHOLDER,
    worktree: rc.worktree || null,
  };

  if (rc.repo) {
    if (rc.repo.startsWith('/')) {
      config.repo = rc.repo;
    } else if (rc.repo.startsWith('~/')) {
      config.repo = path.join(os.homedir(), rc.repo.slice(2));
    } else {
      config.repo = path.join(
        config.location ? path.dirname(config.location) : process.cwd(),
        rc.repo
      );
    }
  } else {
    config.repo = process.cwd();
  }

  if (rc.worktree) {
    config.dataDirectory = path.join(config.repo, rc.worktree);
  } else {
    config.dataDirectory = config.repo;
  }

  return config;
}
