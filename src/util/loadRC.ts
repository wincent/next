/**
 * SPDX-FileCopyrightText: Copyright 2020 Greg Hurrell
 * SPDX-License-Identifier: MIT
 */

import fs from 'fs';
import path from 'path';

import log from './log';
import parseINI from './parseINI';

import type {INI} from './parseINI';

const LOCATION = Symbol('location');

export type RC = INI & {
  [LOCATION]: string | null;
};

export default function loadRC(location?: string): RC {
  if (location) {
    if (fs.existsSync(location)) {
      return {
        ...parseINI(fs.readFileSync(location, 'utf8'), location),
        [LOCATION]: path.resolve(location),
      };
    } else {
      throw new Error(`${location} does not exist`);
    }
  }

  const home = process.env.HOME;

  if (!home || !fs.existsSync(home)) {
    log.warn(`$HOME (${home}) does not exist`);
  }

  const candidates = [];

  let current = process.cwd();

  let seenHome = false;

  for (;;) {
    if (current === home) {
      candidates.push(path.join(current, '.config', 'next', 'nextrc'));

      seenHome = true;
    }

    candidates.push(path.join(current, '.nextrc'));

    const next = path.normalize(path.join(current, '..'));

    if (next === current) {
      if (!seenHome && home) {
        candidates.push(path.join(home, '.config', 'next', 'nextrc'));
        candidates.push(path.join(home, '.nextrc'));
      }

      break;
    }

    current = next;
  }

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return {
        ...parseINI(fs.readFileSync(candidate, 'utf8'), candidate),
        [LOCATION]: candidate,
      };
    }
  }

  log.info(
    'No .nextrc file found; do you want to create one with `next init`?'
  );

  return {
    [LOCATION]: null,
    [parseINI.SECTIONS]: {},
  };
}

loadRC.LOCATION = LOCATION;
