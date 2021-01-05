/**
 * SPDX-FileCopyrightText: Copyright 2021 Greg Hurrell
 * SPDX-License-Identifier: MIT
 */

import UUID from '../UUID';

describe('UUID()', () => {
  it('returns random values', () => {
    expect(UUID()).not.toBe(UUID());
  });

  it('returns something that looks like a UUID', () => {
    expect(UUID()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    );
  });

  it('returns something marked with version 4', () => {
    expect(UUID()[14]).toBe('4');
  });

  it('returns something marked with variant 1', () => {
    expect(UUID()[19]).toMatch(/[89ab]/);
  });
});
