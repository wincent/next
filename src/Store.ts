/**
 * SPDX-FileCopyrightText: Copyright 2021 Greg Hurrell
 * SPDX-License-Identifier: MIT
 */

import fs from 'fs';
import path from 'path';

import UUID from './util/UUID';
import getStringMapFromINI from './util/getStringMapFromINI';

import type {Config} from './getConfig';
import type {INI} from './util/parseINI';

// TODO: all entities should have UUIDs so that if we rename them we can resolve
// conflicts
// TODO: likewise, metadata should have parent UUID link for same reason (if
// conflicting moves, can show UI to choose winner)
// TODO: decide whether areas should have children, or we should look them up
// structure on disk:
//
// tasks/
//    Inbox.tasks
//    Work/
//      Next.tasks
//    .metadata/
//
// ie. we can detect a merge conflict; if somebody tries to rename an area,
// we'll have two folders on disk with same UUID
// if somebody tries to rename a project, likewise
// note we don't need explicit children relation (implied by FS)
// moving a project from one list to another will update parent link
type AreaMetadata = {
  name: string;
  createdAt: string;
  deletedAt: string | null;
  modifiedAt: string | null;
  type: 'area';
  uuid: string;
};

export type Metadata = AreaMetadata | ProjectMetadata | TaskMetadata;

type TaskMetadata = {
  createdAt: string;
  completedAt: string | null;
  deletedAt: string | null;
  loggedAt: string | null;
  modifiedAt: string;
  state: 'done' | 'pending';
  type: 'task';
  uuid: string;
};

type ProjectMetadata = {
  name: string;
  createdAt: string;
  deletedAt: string | null;
  modifiedAt: string | null;
  type: 'project';
  uuid: string;
};

export default class Store {
  #config: Config;

  constructor(config: Config) {
    this.#config = config;
  }

  addTask(description: string): Metadata {
    const now = new Date().toJSON();
    const project = 'Inbox'; // TODO extract area/project if provided

    // TODO: Chicken-and-egg here... who creates the Inbox metadata file? is
    // that part of the init subcommand?

    const metadata: Metadata = {
      createdAt: now,
      completedAt: now,
      deletedAt: null,
      loggedAt: null,
      modifiedAt: now,
      state: 'pending',
      type: 'task',
      uuid: UUID(),
    };

    // TODO: sanitize/format description (eg. could be multiline)

    const task = `o ${description} uuid:${metadata.uuid}\n`;

    fs.writeFileSync(
      path.join(this.#config.dataDirectory, `${project}.tasks`),
      task,
      {encoding: 'utf8', flag: 'a'}
    );

    this._writeMetadata(metadata);

    // TODO: handle special words (eg. project etc)
    // TODO: git commit
    // TODO: update repo-local (gitignored) journal, for the purposes of undo, and also so that we can follow up with stuff like `task done` and have it auto-operate on last-visited task

    return metadata;
  }

  metadataFile(uuid: string): string {
    return path.join(
      this.#config.dataDirectory,
      '.metadata',
      uuid.slice(0, 2),
      `${uuid.slice(2)}.ini`
    );
  }

  // get areas(): Array<Area> {
  //   return [];
  // }

  get projects(): Array<string> {
    return ['Inbox'];
  }

  // get tasks(): Array<Task> {
  // }

  _writeMetadata(metadata: Metadata) {
    const file = this.metadataFile(metadata.uuid);
    const directory = path.dirname(file);
    fs.mkdirSync(directory, {recursive: true});
    fs.writeFileSync(file, metadataToINI(metadata), 'utf8');
  }

  // TODO: if same as on disk, don't update it
  updateMetadata() {}
}

export function metadataToINI(metadata: Metadata): string {
  return Object.entries(metadata).reduce((output, [key, value]) => {
    return output + `${key} = ${value}\n`;
  }, '');
}

/*
export function INIToMetadata(ini: INI): Metadata {
  const map = getStringMapFromINI(ini);

  if (typeof map.createdAt === 'string') {
  }

  return {};
}
*/
