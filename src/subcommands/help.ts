/**
 * SPDX-FileCopyrightText: Copyright 2021 Greg Hurrell
 * SPDX-License-Identifier: MIT
 */

import child_process from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

import formatMarkdown from '../util/formatMarkdown';
import log from '../util/log';
import {SUBCOMMANDS} from './index';

import type {Context} from '../main';
import type {SubcommandsT} from '../parseArgs';

export default async function _help({invocation}: Context): Promise<void> {
  const {args, options} = invocation;

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
      const markdown = formatMarkdown(
        fs.readFileSync(
          path.join(__dirname, '..', '..', 'docs', `${args[0]}.md`),
          'utf8'
        )
      );

      // TODO: show in browser if passed --html
      if (process.env.PAGER) {
        // Hackily write formatted output to temporary file; easier than setting
        // up pipes in Node.
        const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'next'));
        const file = path.join(directory, `${args[0]}.md`);

        fs.writeFileSync(file, markdown, 'utf8');

        const pager = child_process.spawnSync(process.env.PAGER, [file], {
          stdio: 'inherit',
        });
      } else {
        log(markdown);
      }
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
