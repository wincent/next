/**
 * SPDX-FileCopyrightText: Copyright 2021 Greg Hurrell
 * SPDX-License-Identifier: MIT
 */

import fs from 'fs';
import path from 'path';

import UUID from './util/UUID';
import getStringMapFromINI from './util/getStringMapFromINI';
import parseFrontmatter from './util/parseFrontmatter';

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
  project: string;
  state: 'done' | 'pending';
  type: 'task';
  uuid: string;
};

type ProjectMetadata = {
  name: string;
  createdAt: string;
  deletedAt: string | null;
  modifiedAt: string | null;
  area: string | null;
  type: 'project';
  uuid: string;
};

export default class Store {
  #areas: Array<string> | null;
  #config: Config;
  #projects: Array<string> | null;

  constructor(config: Config) {
    this.#areas = null;
    this.#config = config;
    this.#projects = null;
  }

  addArea(name: string): AreaMetadata {
    checkFilename(name);

    if (this.areas.includes(name)) {
      // Read exesting area metadata and return it.

      // TODO: nope, make this a no-op; just return the existing area
      throw new Error(
        `An area with name ${JSON.stringify(name)} already exists`
      );
    }

    const now = new Date().toJSON();

    // TODO: include full path in the metadata that we return, but don't include
    // it in the ini file we write to disk
    const metadata: AreaMetadata = {
      createdAt: now,
      deletedAt: null,
      modifiedAt: now,
      name,
      type: 'area',
      uuid: UUID(),
    };

    fs.mkdirSync(path.join(this.#config.dataDirectory, name));

    fs.writeFileSync(
      path.join(this.#config.dataDirectory, name, '.area.ini'),
      `uuid = ${metadata.uuid}\n`,
      'utf8'
    );

    this._writeMetadata(metadata);

    this.#areas = null;

    return metadata;
  }

  addProject(name: string): ProjectMetadata {
    checkFilename(name);

    if (this.projects.includes(name)) {
      return this.getProject(name);
    }

    const now = new Date().toJSON();

    const metadata: ProjectMetadata = {
      area: null,
      createdAt: now,
      deletedAt: null,
      modifiedAt: now,
      name,
      type: 'project',
      uuid: UUID(),
    };

    fs.writeFileSync(
      path.join(this.#config.dataDirectory, `${name}.tasks`),
      ['---\n', `uuid: ${metadata.uuid}\n`, '---\n'].join(''),
      'utf8'
    );

    this._writeMetadata(metadata);

    return metadata;
  }

  addTask(description: string): TaskMetadata {
    const now = new Date().toJSON();
    let {area, project} = parseTaskDescription(description); // TODO extract area/project if provided

    if (!project) {
      project = 'Inbox';
    } else {
      if (area) {
        // create if doesn't exist
        // create project if it doesn't exist
      } else {
        // create project if it doesn't exist
      }
    }

    const metadata: TaskMetadata = {
      createdAt: now,
      completedAt: now,
      deletedAt: null,
      loggedAt: null,
      modifiedAt: now,
      project: 'invalid temporary UUID', // TODO: stick actual parent UUID in here
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

  getProject(name: string): ProjectMetadata {
    // TODO: this will throw if project doesn't exist; might want to turn this
    // into a better error message than just letting ENOENT bubble up
    const filename = path.join(this.#config.dataDirectory, `${name}.tasks`);
    const contents = fs.readFileSync(filename, 'utf8');

    const {
      metadata: {uuid},
    } = parseFrontmatter(contents, filename);

    // TODO read metadata file and return it
    return {} as ProjectMetadata;
  }

  metadataFile(metadata: Metadata): string {
    return path.join(
      this.#config.dataDirectory,
      '.metadata',
      metadata.type,
      metadata.uuid.slice(0, 2),
      `${metadata.uuid.slice(2)}.ini`
    );
  }

  get areas(): Array<string> {
    if (!this.#areas) {
      this.#areas = fs
        .readdirSync(this.#config.dataDirectory, {withFileTypes: true})
        .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
        .map((entry) => entry.name);
    }
    return this.#areas;
  }

  get projects(): Array<string> {
    if (!this.#projects) {
      this.#projects = [];

      for (const directory of ['', ...this.areas]) {
        const search = path.join(this.#config.dataDirectory, directory);
        for (const entry of fs.readdirSync(search, {withFileTypes: true})) {
          if (!entry.isDirectory() && path.extname(entry.name) === '.tasks') {
            this.#projects.push(
              [directory, entry.name].filter(Boolean).join('/')
            );
          }
        }
      }
    }

    return this.#projects;
  }

  // get tasks(): Array<Task> {
  // }

  _writeMetadata(metadata: Metadata) {
    const file = this.metadataFile(metadata);
    const directory = path.dirname(file);
    fs.mkdirSync(directory, {recursive: true});
    fs.writeFileSync(file, metadataToINI(metadata), 'utf8');
  }

  // TODO: if same as on disk, don't update it
  updateMetadata() {
    // TODO: implement
    return undefined;
  }
}

const ILLEGAL_FILENAME_REGEXP = /[/:\0]/;

export function checkFilename(name: string) {
  if (ILLEGAL_FILENAME_REGEXP.test(name)) {
    throw new Error(
      `${JSON.stringify(
        name
      )} must contain only legal filename characters (ie. anything but /, :, NUL)`
    );
  }
}

export function parseTaskDescription(description: string) {
  let area: string | null = null;
  let project: string | null = null;

  const text = description
    .replace(/@[\S]+\s*/g, (match) => {
      const parts = match.split('/');

      if (parts.length === 2) {
        area = parts[0];
        project = parts[1];
      } else if (parts.length === 1) {
        area = null;
        project = parts[0];
      } else {
        throw new Error(`Invalid area/project ${JSON.stringify(match)}`);
      }

      return '';
    })
    .trim();

  return {
    area,
    project: project as any, // TS insists it's null here
    raw: description,
    text,
  };
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
