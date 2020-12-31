/**
 * SPDX-FileCopyrightText: Copyright 2020 Greg Hurrell
 * SPDX-License-Identifier: MIT
 */

type Invocation = {
  args: Array<string>;
  options: {
    config?: string;
    global: boolean;
    // quiet: boolean;
    // verbose: boolean;
    // [key: string]: string | boolean;
  };
  subcommand: typeof SUBCOMMANDS[number] | null;
};

// TODO: actually import the files and read description strings and options
// schemas from them?
const SUBCOMMANDS = ['add', 'help', 'init'] as const;

export default function parseArgs([
  _node,
  _script,
  ...rest
]: Array<string>): Invocation {
  const args = [];

  let config = undefined;
  let global = false;
  let raw = false;
  let subcommand: Invocation['subcommand'] = null;

  let arg;

  while ((arg = rest.shift())) {
    if (raw) {
      args.push(arg);
    } else if (arg === '--') {
      raw = true;
    } else if (arg === '-c' || arg === '--config') {
      if (rest.length && !rest[0].startsWith('-')) {
        config = rest.shift();
      } else {
        throw new Error('-c/--config requires a filename argument');
      }
    } else if (arg === '-g' || arg === '--global') {
      global = true;
    } else if (arg.startsWith('-')) {
      throw new Error(`unrecognized option: ${arg}`);
    } else if (subcommand === null) {
      if (isSubcommand(arg)) {
        subcommand = arg;
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

  return SUBCOMMANDS.includes(candidate as 'add' | 'help' | 'init');
}
