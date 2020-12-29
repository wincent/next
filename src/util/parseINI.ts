/**
 * SPDX-FileCopyrightText: Copyright 2020 Greg Hurrell
 * SPDX-License-Identifier: MIT
 */

const SECTIONS = Symbol.for('sections');

type INI = {
  [key: string]: string;
  [SECTIONS]: {
    [section: string]: {
      [key: string]: string;
    }
  }
};


export default function parseINI(input: string): INI {
  return {
    [SECTIONS]: {},
  };
}
