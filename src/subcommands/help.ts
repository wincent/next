/**
 * SPDX-FileCopyrightText: Copyright 2021 Greg Hurrell
 * SPDX-License-Identifier: MIT
 */

import type {Invocation} from '../parseArgs';

export default function help({args, options}: Invocation): void {
  console.log('helping', args, options);
  // TODO: require all the other commands and show their help
  // if passed an argument, show markdown help for that command
  // (colorized in terminal, or in browser with --html)
}

export const description = 'Show help';

export const help = `
  TODO: fill in long form help here
`;

export const options = {};
