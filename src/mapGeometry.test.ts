import { describe, expect, it } from 'vitest';
import catalog from '../data/generated/catalog.json';
import map from '../data/generated/map.json';
import { baseGeometryPaths, highlightedGeometryPaths } from './mapGeometry';

describe('map geometry resolution', () => {
  it('renders each parent source feature once and excludes generated parts from the base layer', () => {
    expect(baseGeometryPaths()).toHaveLength(
      map.sourceFeatureIds.reduce(
        (count, id) =>
          count + map.features[id as keyof typeof map.features].paths.length,
        0,
      ),
    );
    expect(map.sourceFeatureIds.every((id) => !id.includes(':part:'))).toBe(
      true,
    );
  });
  it('renders exactly the reviewed active refs for a part override', () => {
    const palestine = catalog.find((item) => item.id === 'iso:PSE')!;
    const active = highlightedGeometryPaths(palestine.geometryRefs);
    expect(palestine.geometryRefs).toEqual([
      'ne:1159320899:part:0',
      'ne:1159320899:part:1',
    ]);
    expect(active).toHaveLength(2);
    expect(active).toEqual(
      palestine.geometryRefs.flatMap(
        (id) => map.features[id as keyof typeof map.features].paths,
      ),
    );
  });
});
