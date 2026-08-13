import { describe, expect, it } from 'vitest';
import catalog from '../data/generated/catalog.json';
import map from '../data/generated/map.json';
import {
  componentSpan,
  deriveComponentFootprints,
  deriveFootprint,
  pathPoints,
  unwrapComponent,
} from './footprint';

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
  it('unwraps an antimeridian component to its local span', () => {
    expect(
      unwrapComponent(
        [
          [1, 0],
          [1439, 1],
        ],
        1440,
      ),
    ).toEqual([
      [1441, 0],
      [1439, 1],
    ]);
  });
  it.each([
    ['iso:FRA', true, true],
    ['iso:USA', true, true],
    ['iso:FJI', false, false],
    ['iso:PSE', false, false],
    ['iso:VAT', false, false],
    ['iso:ALB', true, false],
  ])(
    'uses local generated components for %s',
    (id, desktopPolygon, phonePolygon) => {
      const item = catalog.find((entry) => entry.id === id)!;
      const paths = item.geometryRefs.flatMap(
        (ref) => map.features[ref as keyof typeof map.features].paths,
      );
      const points = pathPoints(paths);
      expect(points.length).toBeGreaterThan(0);
      const desktop = deriveComponentFootprints(paths, 1, map.width);
      const phone = deriveComponentFootprints(paths, 0.25, map.width);
      expect(desktop.some((footprint) => footprint.kind === 'polygon')).toBe(
        desktopPolygon,
      );
      expect(phone.some((footprint) => footprint.kind === 'polygon')).toBe(
        phonePolygon,
      );
      expect(
        desktop.every((footprint) => footprint.radius <= map.width / 2),
      ).toBe(true);
      if (id === 'iso:FJI')
        expect(
          Math.max(...paths.map((path) => componentSpan(path, map.width))),
        ).toBeLessThan(100);
      if (id === 'iso:USA')
        expect(
          Math.max(...paths.map((path) => componentSpan(path, map.width))),
        ).toBeLessThan(600);
      expect(paths).toEqual(
        item.geometryRefs.flatMap(
          (ref) => map.features[ref as keyof typeof map.features].paths,
        ),
      );
    },
  );
  it('proves a reviewed plural source-component mapping', () => {
    const palestine = catalog.find((item) => item.id === 'iso:PSE');
    expect(palestine?.geometryRefs).toHaveLength(2);
    expect(palestine?.geometryRefs.every((ref) => ref.includes(':part:'))).toBe(
      true,
    );
  });
});
