/**
 * SPDX-FileCopyrightText: Copyright 2020 Greg Hurrell
 * SPDX-License-Identifier: MIT
 */

import os from 'os';
import fs from 'fs';
import path from 'path';

import loadRC from '../loadRC';
import log from '../log';
import parseINI from '../parseINI';

describe('loadRC()', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('logs a warning when $HOME is not set', () => {
    jest.spyOn(log, 'warn').mockImplementation(jest.fn());

    withHome(undefined, loadRC);

    expect(log.warn).toHaveBeenCalledWith('$HOME (undefined) does not exist');
  });

  it('logs a warning when $HOME does not exist', () => {
    jest.spyOn(log, 'warn').mockImplementation(jest.fn());

    withHome('/should/not/exist', loadRC);

    expect(log.warn).toHaveBeenCalledWith(
      '$HOME (/should/not/exist) does not exist'
    );
  });

  it('finds the project .nextrc file', () => {
    expect(loadRC()).toEqual({
      branch: 'tasks',
      repo: '.',
      worktree: 'tasks',
      [loadRC.LOCATION]: path.normalize(
        path.join(__dirname, '..', '..', '..', '.nextrc')
      ),
      [parseINI.SECTIONS]: {},
    });
  });

  it('finds ~/.config/next/nextrc when starting under $HOME', () => {
    withScratchDirectory((scratch) => {
      withHome(scratch, () => {
        const rcPath = path.resolve('.config', 'next', 'nextrc');
        fs.mkdirSync(path.join('.config', 'next'), {recursive: true});
        fs.writeFileSync(rcPath, 'test = stuff', 'utf8');

        const workingDirectory = path.join('some', 'other', 'dir');
        fs.mkdirSync(workingDirectory, {recursive: true});
        process.chdir(workingDirectory);

        expect(loadRC()).toEqual({
          test: 'stuff',
          [loadRC.LOCATION]: rcPath,
          [parseINI.SECTIONS]: {},
        });
      });
    });
  });

  it('finds ~/.nextrc when starting under $HOME', () => {
    withScratchDirectory((scratch) => {
      withHome(scratch, () => {
        const rcPath = path.resolve('.nextrc');
        fs.writeFileSync(rcPath, 'test = stuff', 'utf8');

        const workingDirectory = path.join('some', 'other', 'dir');
        fs.mkdirSync(workingDirectory, {recursive: true});
        process.chdir(workingDirectory);

        expect(loadRC()).toEqual({
          test: 'stuff',
          [loadRC.LOCATION]: rcPath,
          [parseINI.SECTIONS]: {},
        });
      });
    });
  });

  it('finds ~/.config/next/nextrc when starting outside $HOME', () => {
    withScratchDirectory((scratch) => {
      withHome(scratch, () => {
        const rcPath = path.resolve('.config', 'next', 'nextrc');
        fs.mkdirSync(path.join('.config', 'next'), {recursive: true});
        fs.writeFileSync(rcPath, 'test = stuff', 'utf8');

        const workingDirectory = os.tmpdir();
        process.chdir(workingDirectory);

        expect(loadRC()).toEqual({
          test: 'stuff',
          [loadRC.LOCATION]: rcPath,
          [parseINI.SECTIONS]: {},
        });
      });
    });
  });

  it('finds ~/.nextrc when starting outside $HOME', () => {
    withScratchDirectory((scratch) => {
      withHome(scratch, () => {
        const rcPath = path.resolve('.nextrc');
        fs.writeFileSync(rcPath, 'test = stuff', 'utf8');

        const workingDirectory = os.tmpdir();
        process.chdir(workingDirectory);

        expect(loadRC()).toEqual({
          test: 'stuff',
          [loadRC.LOCATION]: rcPath,
          [parseINI.SECTIONS]: {},
        });
      });
    });
  });

  it('logs an info notice when no .nextrc is found', () => {
    jest.spyOn(log, 'info').mockImplementation(jest.fn());

    const cwd = process.cwd();

    process.chdir('/');

    try {
      withHome('/', loadRC);
    } finally {
      process.chdir(cwd);
    }

    expect(log.info).toHaveBeenCalledWith(
      'No .nextrc file found; do you want to create one with `next init`?'
    );
  });

  it('loads from an explicitly passed file location', () => {
    withScratchDirectory(() => {
      const rcPath = path.resolve('my.ini');
      fs.writeFileSync(rcPath, 'hello = world', 'utf8');

      process.chdir(os.homedir());

      expect(loadRC(rcPath)).toEqual({
        hello: 'world',
        [loadRC.LOCATION]: rcPath,
        [parseINI.SECTIONS]: {},
      });
    });
  });

  it('complains if the explicitly passed wile location does not exist', () => {
    expect(() => loadRC('/random/file/path')).toThrow(
      '/random/file/path does not exist'
    );
  });
});

function withHome(override: string | undefined, callback: () => void) {
  const home = process.env.HOME;

  try {
    if (home === undefined) {
      delete process.env.HOME;
    } else {
      process.env.HOME = override;
    }

    callback();
  } finally {
    process.env.HOME = home;
  }
}

function withScratchDirectory(callback: (scratch: string) => void) {
  const cwd = process.cwd();

  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'next-'));

  try {
    process.chdir(directory);

    callback(directory);
  } finally {
    process.chdir(cwd);
  }
}
