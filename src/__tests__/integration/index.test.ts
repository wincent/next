/**
 * SPDX-FileCopyrightText: Copyright 2021 Greg Hurrell
 * SPDX-License-Identifier: MIT
 */

import child_process from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

import log from '../../util/log';
import parseShell from '../../util/parseShell';
import {default as mockMulberry32} from '../../util/mulberry32';

/* eslint-disable @typescript-eslint/no-namespace */

declare global {
  namespace jest {
    interface Matchers<R> {
      toPassIntegrationTest(): Promise<CustomMatcherResult>;
    }
  }
}

const SCRIPT_NAME = 'script.sh';

describe('integration tests', () => {
  it('passes the "smoke" test (ie. does this thing even work?)', async () => {
    await expect('0000-smoke-test').toPassIntegrationTest();
  });

  it('runs basic "task add" commands', async () => {
    await expect('1000-basic-task-add').toPassIntegrationTest();
  });
});

expect.extend({
  async toPassIntegrationTest(suiteName) {
    const argv = process.argv;
    const cwd = process.cwd();

    const results: Array<string> = [];
    let tmpdir: string | undefined;

    try {
      jest.resetModules();
      jest.useFakeTimers('modern');
      jest.setSystemTime(new Date('19 May 2021 13:18:30 GMT'));

      const main = require('../../main').default;

      const next = async (...args: Array<string>) => {
        process.argv = [
          argv[0],
          path.resolve(__dirname, '../../main'),
          ...args,
        ];

        await main();
      };

      jest.mock('../../util/UUID', () => {
        let mockCounter = 0;

        const mockRand = mockMulberry32(0xc0dec0de);

        return () => {
          const prefix = Math.floor(0xffffffff * mockRand()).toString(16);
          const suffix = (mockCounter++).toString(16);
          const filler = '0'.repeat(
            Math.max(0, 32 - prefix.length - suffix.length)
          );

          const uuid = prefix + filler + suffix;

          return [
            uuid.substr(0, 8),
            uuid.substr(8, 4),
            uuid.substr(12, 4),
            uuid.substr(16, 4),
            uuid.substr(20, 12),
          ].join('-');
        };
      });

      tmpdir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'next-'));

      process.chdir(tmpdir);

      const commands = (
        await fs.promises.readFile(
          path.join(__dirname, suiteName, SCRIPT_NAME),
          'utf8'
        )
      )
        .split(/\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith('#'));

      const snapshots = path.join(__dirname, suiteName);

      for (let i = 0; i < commands.length; i++) {
        const command = commands[i];
        const [executable, ...args] = parseShell(command);

        if (executable === 'next') {
          await next(...args);
        } else if (executable) {
          child_process.execFileSync('bash', ['-c', command]);
        }

        const snapshot = path.join(snapshots, i.toString(10).padStart(4, '0'));

        if (!fs.existsSync(snapshot)) {
          if (process.env.UPDATE) {
            await fs.promises.mkdir(snapshot, {recursive: true});
            log.info(`Created snapshot directory ${snapshot}`);
          } else {
            results.push(
              `Snapshot directory ${snapshot} doesn't exist (re-run with UPDATE=1 to create it)`
            );
            break;
          }
        }

        const {error, signal, status, stdout, stderr} = child_process.spawnSync(
          'git',
          [
            'diff',
            `--color=${process.stdout.isTTY ? 'always' : 'never'}`,
            '--',
            '.',
            snapshot,
          ]
        );

        if (error) {
          throw error;
        } else if (signal) {
          throw `Signal ${signal} caught while executing 'git diff'`;
        } else if (status === 1) {
          if (process.env.UPDATE) {
            await sync(tmpdir, snapshot);
            log.info(`Updated contents of snapshot directory ${snapshot}`);
          } else {
            results.push(
              'Snapshot does not match:\n',
              stdout.toString(),
              '\n(re-run with UPDATE=1 to update)'
            );
          }
        } else if (status !== 0) {
          throw [`'git diff' exited with status ${status}`, stderr]
            .filter(Boolean)
            .join('\n\n');
        }
      }

      // Check for extraneous snapshot directories.

      for (const entry of await fs.promises.readdir(snapshots, {
        withFileTypes: true,
      })) {
        if (entry.name !== SCRIPT_NAME) {
          if (/^\d{4}$/.test(entry.name)) {
            const number = parseInt(entry.name, 10);
            if (number >= 0 && number < commands.length) {
              continue;
            }
          }
          const item = path.join(snapshots, entry.name);
          if (process.env.UPDATE) {
            await rm(item);
          } else {
            results.push(
              `Extraneous item at ${item} (re-run with UPDATE=1 to clean up)`
            );
          }
        }
      }
    } catch (error) {
      results.push(`Exception caught during execution: ${error}`);
    } finally {
      process.argv = argv;
      process.chdir(cwd);

      jest.useRealTimers();

      if (process.env.DEBUG) {
        log.debug(`${suiteName} temporary directory: ${tmpdir}`);
      }
    }

    return {
      pass: !results.length,
      message: () => (results.length ? results.join('\n') : ''),
    };
  },
});

/**
 * Returns true if the passed filesystem entry is "exotic" (ie. a symlink, or a
 * socket, or a pipe, or a device etc).
 */
async function isExotic(entry: string) {
  if (fs.existsSync(entry)) {
    const stats = await fs.promises.stat(entry);

    if (stats.isFile() || stats.isDirectory()) {
      return stats.isSymbolicLink();
    }
    return true;
  }
  return false;
}

async function rm(item: string) {
  const stats = await fs.promises.stat(item);

  if (stats.isDirectory()) {
    for (const entry of await fs.promises.readdir(item, {
      withFileTypes: true,
    })) {
      await rm(path.join(item, entry.name));
    }
    await fs.promises.rmdir(item);
  } else {
    await fs.promises.unlink(item);
  }
}

/**
 * Updates `destinationDirectory` to match `sourceDirectory`. Files and
 * directories present in `sourceDirectory` but missing from
 * `destinationDirectory` are added. Files and directories present in
 * `destinationDirectory` but absent from `sourceDirectory` are removed.
 */
async function sync(sourceDirectory: string, destinationDirectory: string) {
  const paths = new Set();

  async function copyMissing(source: string, destination: string) {
    await fs.promises.mkdir(destination, {recursive: true});

    for (const entry of await fs.promises.readdir(source, {
      withFileTypes: true,
    })) {
      const sourceEntry = path.join(source, entry.name);
      const destinationEntry = path.join(destination, entry.name);
      if (await isExotic(sourceEntry)) {
        throw new Error(`source ${sourceEntry} is exotic`);
      } else if (await isExotic(destinationEntry)) {
        throw new Error(`destination ${destinationEntry} is exotic`);
      } else if (entry.isDirectory()) {
        await copyMissing(sourceEntry, destinationEntry);
      } else {
        await fs.promises.copyFile(sourceEntry, destinationEntry);
      }
      paths.add(path.relative(sourceDirectory, sourceEntry));
    }
  }

  await copyMissing(sourceDirectory, destinationDirectory);

  async function deleteExtraneous(targetDirectory: string) {
    for (const entry of await fs.promises.readdir(targetDirectory, {
      withFileTypes: true,
    })) {
      const target = path.join(targetDirectory, entry.name);
      const relative = path.relative(destinationDirectory, target);
      if (entry.isDirectory()) {
        await deleteExtraneous(target);
        if (!paths.has(relative)) {
          await fs.promises.rmdir(target);
        }
      } else if (!paths.has(path.relative(destinationDirectory, target))) {
        await fs.promises.unlink(target);
      }
    }
  }

  await deleteExtraneous(destinationDirectory);
}
