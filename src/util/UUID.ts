/**
 * SPDX-FileCopyrightText: Copyright 2021 Greg Hurrell
 * SPDX-License-Identifier: MIT
 */

import crypto from 'crypto';

/***
 * Return a v4 (random) UUID in string format
 * (https://tools.ietf.org/html/rfc4122).
 *
 * Example:
 *                            node
 *                            |
 *             time-mid  clock-seq-and-reserved
 *             |         |    |
 *             v    *    v    v
 *    f81d4fae-7dec-41d0-a765-00a0c91e6bf6
 *    ^             ^    # ^
 *    |             |      |
 *    time-low      time-high-and-version
 *                         |
 *                         clock-seq-low
 *
 * - Version 4 ("0100") most-significant 4 bits of time-high-and-version (*).
 * - Variant 1 ("10") most-significant 2 bits of clock-seq-and-reserved (#).
 * - Rest random.
 */
export default function UUID(): string {
  const bytes = new Uint8Array(16);

  crypto.randomFillSync(bytes);

  // Set version.
  bytes[6] = (bytes[6] & 0b00001111) | 0b01000000;

  // Set variant.
  bytes[8] = (bytes[8] & 0b00111111) | 0b10000000;

  // To string.
  let i = 0;

  return 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'.replace(/xx/g, () => {
    return bytes[i++].toString(16).padStart(2, '0');
  });
}
