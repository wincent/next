/**
 * SPDX-FileCopyrightText: Copyright 2021 Greg Hurrell
 * SPDX-License-Identifier: MIT
 */

/**
 * Simple PRNG (pseudorandom number generator) that has 32 bits of state, is
 * fast, and relatively high-quality (passes the gjrand test suite).
 *
 * @see https://stackoverflow.com/a/47593316
 * @see https://gist.github.com/tommyettinger/46a874533244883189143505d203312c
 * @see http://gjrand.sourceforge.net/
 */
export default function mulberry32(a: number): () => number {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
