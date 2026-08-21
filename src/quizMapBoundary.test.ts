import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { mapLocationForQuizId } from './quizMapBoundary';
import { mapLayerConfigs, mapLayerForQuiz } from './quizContracts';

describe('map location resolution', () => {
  it('resolves state IDs through generated exact geometry', () => {
    expect(mapLocationForQuizId('US-AK')?.geometryRefs).toEqual([
      'ne:admin1:1159308731',
    ]);
    expect(mapLocationForQuizId('US-HI')?.geometryRefs).toEqual([
      'ne:admin1:1159308409',
    ]);
  });

  it('keeps rendering generic and supports a future config-only map', () => {
    const mainSource = readFileSync(
      new URL('./main.tsx', import.meta.url),
      'utf8',
    );
    const boundarySource = readFileSync(
      new URL('./quizMapBoundary.ts', import.meta.url),
      'utf8',
    );
    expect(mainSource).not.toMatch(
      /US_STATES|isUsStates|stateBoundaries|quizId\s*===/,
    );
    expect(boundarySource).not.toMatch(
      /US_STATES|isUsStates|stateBoundaries|quizId\s*===|ne:1159321369/,
    );

    mapLayerConfigs['future-custom'] = {
      contextFeatureIds: [],
      baseLayers: [],
      wrapActive: false,
      viewBox: '1 2 3 4',
      selectable: true,
    };
    try {
      expect(
        mapLayerForQuiz('future-custom', {
          geometryRefs: ['ne:admin1:1159308731'],
        }),
      ).toMatchObject({
        viewBox: '1 2 3 4',
        wrapActive: false,
        selectable: true,
      });
    } finally {
      delete mapLayerConfigs['future-custom'];
    }
  });
});
