/**
 * SPDX-FileCopyrightText: Copyright 2021 Greg Hurrell
 * SPDX-License-Identifier: MIT
 */

import path from 'path';

import log from '../util/log';
import {SUBCOMMANDS} from './index';

import type {Invocation, SubcommandsT} from '../parseArgs';

export default function _help({args, options}: Invocation): void {
  if (args.length === 0) {
    log(
      'usage: next [-g | --global] [-c |--config <path>] <subcommand> [<args>]\n'
    );

    const longest = SUBCOMMANDS.reduce((acc, subcommand) => {
      return subcommand.length > acc ? subcommand.length : acc;
    }, -Infinity);

    const subcommands = SUBCOMMANDS.map((subcommand) => {
      const {description} = require(`.${path.sep}${subcommand}`);
      return {description, subcommand};
    });

    log('Commands:\n');

    for (const {description, subcommand} of subcommands) {
      log(`${subcommand.padStart(longest + 2)}  ${description}`);
    }

    log('');
    log('To see options for a specific subcommand:\n');
    log('  task <subcommand> -h | --help\n');
    log('To read full documentation for a specific subcommand:\n');
    log('  task help <subcommand>\n');
  } else if (
    args.length === 1 &&
    // TODO: consider adding topic (not subcommand) help here as well
    SUBCOMMANDS.includes(args[0] as SubcommandsT)
  ) {
    if (options.help) {
      log(require(`.${path.sep}${args[0]}`).help);
    } else {
      // TODO: show full docs: markdown help (colorized in terminal, or in browser with --html)
    }
  } else {
    throw new Error(
      `Expected exactly one of: ${SUBCOMMANDS.join(', ')}\n` +
        `Got: ${args.join(' ')}`
    );
  }
}

export const description = 'Show help';

export const help = `
  Shows help for the specified subcommand.

  To see a brief summary (like this one), invoke using one of:

      next help <subcommand> -h
      next <subcommand> -h

  To see full documentation, invoke with:

      next help <subcommand>
`;

export const options = {};
