import { describe, expect, it } from 'vitest';
import {
  generatedInset,
  generatedLocations,
  generatedMap,
} from '../contracts/generatedData';
import { quizOptions } from '../contracts/quiz';
import {
  deriveCalloutLayout,
  deriveCalloutModel,
  mapXForLongitude,
} from '../footprint';
import { createMapProjection } from '../mapProjection';
import { mapLayerForLocation, mapLayerForQuiz } from '../quizMapBoundary';
import { buildMapRenderModel } from './renderModel';

function parseViewBox(value: string): [number, number, number, number] {
  const parts = value.trim().split(/\s+/).map(Number);
  if (parts.length !== 4 || !parts.every(Number.isFinite)) {
    throw new Error(`Invalid viewBox: ${value}`);
  }
  return [parts[0]!, parts[1]!, parts[2]!, parts[3]!];
}

describe('map render model', () => {
  it.each([
    ['wide', 1440, 720],
    ['mobile', 320, 180],
  ])(
    'preserves ordinary path ordering at %s viewport',
    (_name, width, height) => {
      const active = generatedLocations.find((location) =>
        location.id.startsWith('iso:'),
      );
      if (!active) throw new Error('An ordinary world location is missing');
      const layer = mapLayerForLocation(active);
      const model = buildMapRenderModel({
        active,
        layer,
        map: generatedMap,
        inset: generatedInset,
        viewportWidth: width,
        viewportHeight: height,
      });
      expect(model.activePathCopies.map(({ path }) => path)).toEqual(
        layer.activePaths,
      );
      expect(model.renderedMapWidth).toBe(generatedMap.width + 200);
      expect(model.projection.yScale).toBe(1);
    },
  );

  it('produces seam copies and high-resolution callout entries for MI', () => {
    const active = generatedLocations.find(
      (location) => location.id === 'US-MI',
    );
    if (!active) throw new Error('US-MI fixture is missing');
    const layer = mapLayerForLocation(active);
    const model = buildMapRenderModel({
      active,
      layer,
      map: generatedMap,
      inset: generatedInset,
      viewportWidth: 720,
      viewportHeight: 420,
    });
    expect(model.insetSelectedPathCopies.length).toBeGreaterThan(0);
    expect(model.insetSourcePathCopies.length).toBe(
      generatedInset.sourceFeatureIds.length,
    );
    expect(model.insetContextPathCopies.length).toBe(layer.baseLayers.length);
    expect(model.projectedInsetSelectedPaths.length).toBeGreaterThan(0);
  });

  it('keeps every mapped-quiz callout source inside its configured viewport', () => {
    for (const quiz of quizOptions.filter((candidate) => candidate.map)) {
      const mapConfig = quiz.map;
      if (!mapConfig) continue;
      const viewBoxValue = mapConfig.viewBox;
      if (!viewBoxValue) continue;
      const [viewBoxX, viewBoxY, viewBoxWidth, viewBoxHeight] =
        parseViewBox(viewBoxValue);
      const viewportBounds: [number, number, number, number] = [
        viewBoxX,
        viewBoxX + viewBoxWidth,
        viewBoxY,
        viewBoxY + viewBoxHeight,
      ];
      const [minX, maxX, minY, maxY] = viewportBounds;
      const scale = 1309 / (maxX - minX);
      const projection = createMapProjection(
        mapConfig.standardParallel ?? 0,
        (minY + maxY) / 2,
      );
      for (const id of quiz.locationIds) {
        const active = generatedLocations.find(
          (location) => location.id === id,
        );
        if (!active) throw new Error(`Missing generated location ${id}`);
        const layer = mapLayerForQuiz(quiz, active);
        const callout = deriveCalloutModel(
          layer.activePaths.map(projection.path),
          scale,
          mapConfig.wrapWidth ?? 1440,
          undefined,
          undefined,
          mapXForLongitude(
            mapConfig.seamLongitude ?? 152,
            mapConfig.wrapWidth ?? 1440,
          ),
        );
        if (!callout) continue;
        const layout = deriveCalloutLayout(
          callout,
          scale,
          mapConfig.wrapWidth ?? 1440,
          573 / scale,
          1309,
          viewportBounds,
        );
        expect(layout.sourceCenter[0]).toBeGreaterThanOrEqual(minX);
        expect(layout.sourceCenter[0]).toBeLessThanOrEqual(maxX);
        expect(layout.sourceCenter[1]).toBeGreaterThanOrEqual(minY);
        expect(layout.sourceCenter[1]).toBeLessThanOrEqual(maxY);
      }
    }
  });
});
