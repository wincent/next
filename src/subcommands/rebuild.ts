/**
 * SPDX-FileCopyrightText: Copyright 2021 Greg Hurrell
 * SPDX-License-Identifier: MIT
 */

import fs from 'fs';
import path from 'path';

import Store from '../Store';

import log from '../util/log';
import parseINI from '../util/parseINI';

import type {Metadata} from '../Store';
import type {Context} from '../main';
import type {INI} from '../util/parseINI';

export default function rebuild({config, invocation}: Context): void {
  if (invocation.args.length) {
    log.warn(
      `Ignoring excess arguments to \`rebuild\`: ${invocation.args.join(' ')}`
    );
  }

  const store = new Store(config);

  // TODO: also look at areas/projects etc.
  const metadata = path.join(config.dataDirectory, '.metadata');

  // TODO: check worktree status etc if not already checked by the time we get
  // here

  if (!fs.existsSync(metadata)) {
    log.warn(`Metadata directory ${metadata} does not exist; creating...`);
    // TODO: actually create it
    return;
  }

  let errorCount = 0;
  let validCount = 0;
  let warningCount = 0;

  for (const entry of fs.readdirSync(metadata, {withFileTypes: true})) {
    if (entry.name.match(/^[0-9a-f]{2}$/) && entry.isDirectory()) {
      const subdirectory = path.join(metadata, entry.name);
      for (const file of fs.readdirSync(subdirectory, {withFileTypes: true})) {
        if (path.extname(file.name) === '.ini' && !file.isDirectory()) {
          // TODO: check that filename has UUID format
          // TODO: check that filename matches internal uuid field and vice versa
          try {
            const ini = path.join(subdirectory, file.name);
            const parsed = parseINI(fs.readFileSync(ini, 'utf8'), ini);
            if (parsed.type === 'area') {
              normalizeArea(parsed, store);
            } else if (parsed.type === 'project') {
              normalizeProject(parsed, store);
            } else if (parsed.type === 'task') {
              normalizeTask(parsed, store);
            } else {
              log.warn(`Unknown metadata type (${parsed.type}) for ${ini}`);
              warningCount++;
              continue;
            }
            validCount++;
          } catch (error) {
            log.error(error);
            errorCount++;
          }
        }
      }
    }
    // if (path.extname(file.name) === '.tasks') {
    //   console.log('looking at', file);
    // }
  }

  log[errorCount ? 'error' : 'info'](`Errors: ${errorCount}`);
  log[warningCount ? 'warn' : 'info'](`Warnings: ${warningCount}`);
  log.info(`Valid: ${validCount}`);
}

function normalizeArea(metadata: INI, store: Store) {
  return;
}

function normalizeProject(metadata: INI, store: Store) {
  return;
}

function normalizeTask(metadata: INI, store: Store) {
  expectDate(metadata.createdAt);
  if (metadata.completedAt !== 'null') {
    if (metadata.completedAt === undefined) {
      log.info(`Missing completedAt -> setting to null`);
    } else {
      expectDate(metadata.completedAt);
    }
  }
  if (metadata.status !== 'done' && metadata.status !== 'pending') {
    // bad...
  }
  if (metadata.type !== 'task') {
    // bad...
  }
  // uuid matches
  // loggedAt is date or null
  // modifiedAt is date or null
}

function expectDate(dateString: unknown) {
  if (
    typeof dateString === 'string' &&
    new Date(dateString).toJSON() !== null
  ) {
    return;
  }

  log.warn(`Invalid date string: ${dateString}`);
}

export const description = 'Rebuilds task database';

export const help = `
  Checks and freshens every task in the database.

  For example, new fields are added to older tasks.
`;

export const options = {
  // TODO: add a dry-run flag here to show what would be done without actually
  // doing it
};
