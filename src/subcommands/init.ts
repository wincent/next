/**
 * SPDX-FileCopyrightText: Copyright 2021 Greg Hurrell
 * SPDX-License-Identifier: MIT
 */

import type {Invocation} from '../parseArgs';

export default function init({args, options}: Invocation): void {
  console.log('initing', args, options);
}

export const description = 'Initialize a project by creating a .nextrc file';

export const help = `
  TODO: fill in long form help here
`;

export const options = {};
