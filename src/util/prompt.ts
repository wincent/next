/**
 * SPDX-FileCopyrightText: Copyright 2020 Greg Hurrell
 * SPDX-License-Identifier: MIT
 */

import readline from 'readline';

export default function prompt(question: string): string {
  process.stdout.write(`${question} `);

  process.stdout.write('\n');
  return 'y';
}
