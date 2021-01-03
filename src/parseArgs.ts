/**
 * SPDX-FileCopyrightText: Copyright 2020 Greg Hurrell
 * SPDX-License-Identifier: MIT
 */

import {SUBCOMMANDS} from './subcommands';

export type SubcommandsT = typeof SUBCOMMANDS[number];

export type Invocation = {
  args: Array<string>;
  options: {
    config: string | false;
    global: boolean;
    help: boolean;
    // quiet: boolean;
    // verbose: boolean;
    [key: string]: string | boolean;
  };
  subcommand: SubcommandsT | null;
};

type Schema = {
  [key: string]: {
    description: string;
    type: 'boolean' | 'string';
  };
};

export default function parseArgs([
  _node,
  _script,
  ...rest
]: Array<string>): Invocation {
  const args = [];
  const options: {[key: string]: boolean | string} = {};

  let config: string | false = false;
  let global = false;
  let help = false;
  let raw = false;
  let subcommand: Invocation['subcommand'] = null;

  let schema: Schema = {};

  let arg;

  while ((arg = rest.shift())) {
    if (raw) {
      args.push(arg);
    } else if (arg === '--') {
      raw = true;
    } else if (arg === '-c' || arg === '--config') {
      const next = rest.shift();

      if (next && !next.startsWith('-')) {
        config = next;
      } else {
        throw new Error('-c/--config requires a filename argument');
      }
    } else if (arg === '-g' || arg === '--global') {
      global = true;
    } else if (arg === '-h' || arg === '--help') {
      help = true;
      break;
    } else if (arg.startsWith('-')) {
      if (schema) {
        if (arg in schema) {
          if (schema[arg].type === 'boolean') {
            options[arg] = true;
          } else {
            const next = rest.shift();

            if (next && !next.startsWith('-')) {
              options[arg] = next;
            } else {
              throw new Error(`${arg} requires an argument`);
            }
          }
          break;
        }
      }
      throw new Error(`unrecognized option: ${arg}`);
    } else if (subcommand === null) {
      if (isSubcommand(arg)) {
        subcommand = arg;
        if (subcommand === 'add') {
          schema = require('./subcommands/add').options;
        } else if (subcommand === 'help') {
          schema = require('./subcommands/help').options;
        } else if (subcommand === 'init') {
          schema = require('./subcommands/init').options;
        }
      } else {
        throw new Error(`unrecognized subcommand: ${arg}`);
      }
    } else {
      args.push(arg);
    }
  }

  return {
    args,
    options: {
      config,
      global,
      help,
      ...options,
    },
    subcommand,
  };
}

function isSubcommand(
  candidate: string | null
): candidate is Invocation['subcommand'] {
  if (!candidate) {
    return false;
  }

  return SUBCOMMANDS.includes(candidate as SubcommandsT);
}
