import { describe, expect, it } from 'vitest';
import { deriveFootprint } from './footprint';
import catalog from '../data/generated/catalog.json';
import map from '../data/generated/map.json';
import { pathPoints } from './footprint';
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
  it.each(['iso:FRA', 'iso:USA', 'iso:FJI', 'iso:PSE', 'iso:VAT'])(
    'uses generated geometry for %s at desktop and phone widths',
    (id) => {
      const item = catalog.find((entry) => entry.id === id)!;
      const paths = item.geometryRefs.flatMap(
        (ref) => map.features[ref as keyof typeof map.features].paths,
      );
      const points = pathPoints(paths);
      expect(points.length).toBeGreaterThan(0);
      const desktop = deriveFootprint(points.map(([x, y]) => [x, y]));
      const phone = deriveFootprint(points.map(([x, y]) => [x / 4, y / 4]));
      expect(desktop.center).not.toEqual([0, 0]);
      expect(phone.radius).toBeGreaterThan(0);
      expect(paths).toEqual(
        item.geometryRefs.flatMap(
          (ref) => map.features[ref as keyof typeof map.features].paths,
        ),
      );
    },
  );
});
