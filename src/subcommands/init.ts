/**
 * SPDX-FileCopyrightText: Copyright 2021 Greg Hurrell
 * SPDX-License-Identifier: MIT
 */

import type {Context} from '../main';

export default function init({config, invocation}: Context): void {
  console.log('initing', config, invocation);
}

export const description = 'Initialize a project by creating a .nextrc file';

export const help = `
  TODO: fill in long form help here
`;

export const options = {};
