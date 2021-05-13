/**
 * SPDX-FileCopyrightText: Copyright 2021 Greg Hurrell
 * SPDX-License-Identifier: MIT
 */

import {promises as fs} from 'fs';
import os from 'os';
import path from 'path';

import {default as mockMulberry32} from '../../util/mulberry32';

/* eslint-disable @typescript-eslint/no-namespace */

declare global {
  namespace jest {
    interface Matchers<R> {
      toPassIntegrationTest(): CustomMatcherResult;
    }
  }
}

expect.extend({
  async toPassIntegrationTest(suiteName) {
    const argv = process.argv;
    const cwd = process.cwd();

    try {
      jest.resetModules();

      const main = require('../../main').default;

      const next = async (...args: Array<string>) => {
        process.argv = [argv[0], path.resolve('../../main'), ...args];

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

      const tmpdir = await fs.mkdtemp(path.join(os.tmpdir(), 'next-'));

      process.chdir(tmpdir);

      // TODO: read commands from suite (eval?)
      // TODO: run them, verifying expected result at each step

      await next('add', 'here', 'is', 'my', 'sample', 'task');
    } finally {
      process.argv = argv;
      process.chdir(cwd);
    }

    return {
      pass: true,
      message: () => 'all is well',
    };
  },
});

describe('integration tests', () => {
  it('runs basic "task add" commands', async () => {
    await expect('1000-basic-task-add').toPassIntegrationTest();
  });
});
