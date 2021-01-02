/**
 * SPDX-FileCopyrightText: Copyright 2021 Greg Hurrell
 * SPDX-License-Identifier: MIT
 */

import type {Invocation} from '../parseArgs';

export default function help({args, options}: Invocation): void {
  console.log('helping', args, options);
}
