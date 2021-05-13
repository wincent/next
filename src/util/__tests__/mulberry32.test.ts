/**
 * SPDX-FileCopyrightText: Copyright 2021 Greg Hurrell
 * SPDX-License-Identifier: MIT
 */

import mulberry32 from '../mulberry32';

describe('mulberry32()', () => {
  it('returns a PRNG', () => {
    const seed = 0xfeedface;

    const rand = mulberry32(seed);

    expect(rand()).toBeCloseTo(0.6037914503831416);
    expect(rand()).toBeCloseTo(0.25472700083628297);
    expect(rand()).toBeCloseTo(0.40728675154969096);
  });

  it('produces different numbers given a different seed', () => {
    const seed1 = 0xfeedface;
    const seed2 = 0xdeadbeef;

    const rand1 = mulberry32(seed1);
    const rand2 = mulberry32(seed2);

    expect(rand1()).not.toBeCloseTo(rand2());
    expect(rand1()).not.toBeCloseTo(rand2());
    expect(rand1()).not.toBeCloseTo(rand2());
  });
});
