/**
 * SPDX-FileCopyrightText: Copyright 2020 Greg Hurrell
 * SPDX-License-Identifier: MIT
 */

import child_process from 'child_process';

export default function run(
  executable: string,
  ...args: Array<string>
): string {
  const {error, signal, status, stderr, stdout} = child_process.spawnSync(
    executable,
    args
  );

  if (error) {
    throw error;
  } else if (status) {
    throw new Error(
      `Command "${[executable, ...args].join(
        ' '
      )}" exited with status ${status}`
    );
  } else if (signal) {
    throw new Error(
      `Command "${[executable, ...args].join(
        ' '
      )}" exited due to signal ${signal}`
    );
  }

  return stdout.toString();
}
