/**
 * SPDX-FileCopyrightText: Copyright 2021 Greg Hurrell
 * SPDX-License-Identifier: MIT
 */

import type {Context} from '../main';

export default function init({config, invocation}: Context): void {
  console.log('initing', config, invocation);
  // check to see whether .nextrc already exists
  // create inbox?
  //
}

export const description = 'Initialize a project';

export const help = `
  Initializes a project by creating a .nextrc file and setting up the
  corresponding data directory.
`;

// TODO: maybe a -y option to do everything without interactive promps
export const options = {};
