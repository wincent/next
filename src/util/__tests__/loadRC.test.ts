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
      [parseINI.SECTIONS]: {},
    });
  });

  it('finds ~/.config/next/nextrc when starting under $HOME', () => {
    withScratchDirectory((scratch) => {
      withHome(scratch, () => {
        fs.mkdirSync(path.join('.config', 'next'), {recursive: true});
        fs.writeFileSync(
          path.join('.config', 'next', 'nextrc'),
          'test = stuff',
          'utf8'
        );

        const workingDirectory = path.join('some', 'other', 'dir');
        fs.mkdirSync(workingDirectory, {recursive: true});
        process.chdir(workingDirectory);

        expect(loadRC()).toEqual({
          test: 'stuff',
          [parseINI.SECTIONS]: {},
        });
      });
    });
  });

  it('finds ~/.nextrc when starting under $HOME', () => {
    withScratchDirectory((scratch) => {
      withHome(scratch, () => {
        fs.writeFileSync(path.join('.nextrc'), 'test = stuff', 'utf8');

        const workingDirectory = path.join('some', 'other', 'dir');
        fs.mkdirSync(workingDirectory, {recursive: true});
        process.chdir(workingDirectory);

        expect(loadRC()).toEqual({
          test: 'stuff',
          [parseINI.SECTIONS]: {},
        });
      });
    });
  });

  it('finds ~/.config/next/nextrc when starting outside $HOME', () => {
    withScratchDirectory((scratch) => {
      withHome(scratch, () => {
        fs.mkdirSync(path.join('.config', 'next'), {recursive: true});
        fs.writeFileSync(
          path.join('.config', 'next', 'nextrc'),
          'test = stuff',
          'utf8'
        );

        const workingDirectory = os.tmpdir();
        process.chdir(workingDirectory);

        expect(loadRC()).toEqual({
          test: 'stuff',
          [parseINI.SECTIONS]: {},
        });
      });
    });
  });

  it('finds ~/.nextrc when starting outside $HOME', () => {
    withScratchDirectory((scratch) => {
      withHome(scratch, () => {
        fs.writeFileSync(path.join('.nextrc'), 'test = stuff', 'utf8');

        const workingDirectory = os.tmpdir();
        process.chdir(workingDirectory);

        expect(loadRC()).toEqual({
          test: 'stuff',
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

  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'next'));

  try {
    process.chdir(directory);

    callback(directory);
  } finally {
    process.chdir(cwd);
  }
}
