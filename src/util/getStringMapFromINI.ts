/**
 * SPDX-FileCopyrightText: Copyright 2021 Greg Hurrell
 * SPDX-License-Identifier: MIT
 */

import type {INI} from './parseINI';

export type StringMap = {
  [key: string]: string | null;
};

/**
 * Transforms an INI object into a simpler type where all values are strings or
 * `null` (the string "null" is transformed to `null`).
 *
 * Used for internal metadata, where we don't use nesting (sections) and there
 * are no arbitrary values.
 */
export default function getStringMapFromINI(ini: INI): StringMap {
  const map: StringMap = {};

  for (const [key, value] of Object.entries(ini)) {
    if (value === 'null') {
      map[key] = null;
    } else {
      map[key] = value;
    }
  }

  return map;
}
