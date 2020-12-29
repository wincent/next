/**
 * SPDX-FileCopyrightText: Copyright 2020 Greg Hurrell
 * SPDX-License-Identifier: MIT
 */

import run from './run';

export default function git(
  subcommand: string,
  ...args: Array<string>
): string {
  return run('git', subcommand, ...args);
}
