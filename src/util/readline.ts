/**
 * SPDX-FileCopyrightText: Copyright 2020 Greg Hurrell
 * SPDX-License-Identifier: MIT
 */

import {createInterface} from 'readline';

import log from './log';

export function choose(
  question: string,
  choices: Array<string>,
  defaultChoice?: string
): Promise<string> {
  const readline = getInterface();

  // TODO: allow cursor-key selection as well
  return new Promise((resolve) => {
    choices.forEach((choice, i) => log(`${i + 1}. ${choice}`));
    readline.question(`${question} > `, resolve);
    if (defaultChoice) {
      readline.write(
        String(choices.findIndex((choice) => choice === defaultChoice) + 1)
      );
    }
  })
    .then((result) => {
      const choice = Math.floor(Number(result)) - 1;
      if (choice >= 0 && choice < choices.length) {
        return choices[choice];
      } else {
        log.warn(`Invalid choice: ${result}`);
        return choose(question, choices, defaultChoice);
      }
    })
    .finally(() => {
      readline.close();
    });
}

export function confirm(question: string): Promise<boolean> {
  const readline = getInterface();

  return new Promise((resolve) => {
    readline.question(`${question} [y/n] `, resolve);
    readline.write('y');
  })
    .then((result) => {
      return /^\s*y(es?)?\s*$/i.test(String(result));
    })
    .finally(() => {
      readline.close();
    });
}

export function prompt(question: string, defaultAnswer = ''): Promise<string> {
  const readline = getInterface();

  return new Promise((resolve) => {
    readline.question(`${question} `, resolve);
    readline.write(defaultAnswer);
  })
    .then(String)
    .finally(() => {
      readline.close();
    });
}

function getInterface() {
  return createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}
