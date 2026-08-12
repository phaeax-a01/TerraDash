import { describe, expect, it } from 'vitest';
import { deriveFootprint } from './footprint';
describe('deriveFootprint', () => {
  it('uses true polygon at threshold', () =>
    expect(
      deriveFootprint([
        [0, 0],
        [10, 10],
      ]).kind,
    ).toBe('polygon'));
  it('adds a minimum footprint below threshold without changing source points', () => {
    const points: [number, number][] = [
      [5, 5],
      [6, 6],
    ];
    const result = deriveFootprint(points);
    expect(result.kind).toBe('circle');
    expect(result.radius).toBe(5);
    expect(points).toEqual([
      [5, 5],
      [6, 6],
    ]);
  });
});
