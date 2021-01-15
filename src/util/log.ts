/**
 * SPDX-FileCopyrightText: Copyright 2020 Greg Hurrell
 * SPDX-License-Identifier: MIT
 */

const isTTY = process.stdout.isTTY;

const BOLD = isTTY ? '\x1b[1m' : '';
const GREEN = isTTY ? '\x1b[32m' : '';
const RED = isTTY ? '\x1b[31m' : '';
const RESET = isTTY ? '\x1b[0m' : '';
const YELLOW = isTTY ? '\x1b[33m' : '';

/* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
type Loggable = any;

export function bold(text: string): string {
  return `${BOLD}${text}${RESET}`;
}

export default function log(...messages: Array<Loggable>): void {
  console.log(...messages);
}

log.error = function error(first: Loggable, ...rest: Array<Loggable>) {
  console.log(...[`[error] ${first}`, ...rest].map(colorize(RED + BOLD)));
};

log.info = function info(first: Loggable, ...rest: Array<Loggable>) {
  console.log(...[`[info] ${first}`, ...rest].map(colorize(BOLD)));
};

log.notice = function notice(first: Loggable, ...rest: Array<Loggable>) {
  console.log(...[`[notice] ${first}`, ...rest].map(colorize(GREEN + BOLD)));
};

log.warn = function warn(first: Loggable, ...rest: Array<Loggable>) {
  console.log(...[`[warning] ${first}`, ...rest].map(colorize(YELLOW + BOLD)));
};

function colorize(color: string) {
  return (text: string) => `${color}${text}${RESET}`;
}
