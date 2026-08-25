import { describe, expect, it } from 'vitest';
import {
  bounds,
  buildGeometryFeature,
  pathPoints,
  project,
} from './geometry.mjs';

describe('generator geometry seams', () => {
  it('preserves the pinned equirectangular projection', () => {
    expect(project([0, 0])).toEqual([720, 360]);
  });

  it('builds deterministic paths and bounds from a polygon', () => {
    const geometry = {
      type: 'Polygon',
      coordinates: [
        [
          [-1, -1],
          [1, -1],
          [1, 1],
          [-1, 1],
          [-1, -1],
        ],
      ],
    };
    const feature = buildGeometryFeature(geometry, 'test:polygon');

    expect(feature.paths).toEqual(['M716,364L724,364L724,356L716,356Z']);
    expect(bounds(pathPoints(feature.paths))).toEqual([716, 356, 724, 364]);
  });

  it('retains inset ring validity metadata', () => {
    const geometry = {
      type: 'Polygon',
      coordinates: [
        [
          [-1, -1],
          [1, -1],
          [1, 1],
          [-1, 1],
          [-1, -1],
        ],
      ],
    };
    const feature = buildGeometryFeature(geometry, 'test:inset', 'inset');

    expect(feature.polygons[0].rings[0]).toMatchObject({
      sourceClosed: true,
      sourceValid: true,
      projectedValid: true,
      generatorInducedDegenerate: false,
      valid: true,
    });
  });

  it('keeps default simplification while allowing regional detail opt-in', () => {
    const geometry = {
      type: 'Polygon',
      coordinates: [
        [
          [0, 0],
          [0.05, 0.05],
          [0.1, 0],
          [0, 0],
        ],
      ],
    };
    const defaultPoints = pathPoints(
      buildGeometryFeature(geometry, 'test:default').paths,
    );
    const regionalPoints = pathPoints(
      buildGeometryFeature(geometry, 'test:regional', 'main', 0.12).paths,
    );

    expect(defaultPoints).not.toContainEqual([720.2, 359.8]);
    expect(regionalPoints).toContainEqual([720.2, 359.8]);
  });
});
