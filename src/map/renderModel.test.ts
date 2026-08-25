import { describe, expect, it } from 'vitest';
import {
  generatedInset,
  generatedLocations,
  generatedMap,
} from '../contracts/generatedData';
import { quizOptions } from '../contracts/quiz';
import { mapLayerForLocation, mapLayerForQuiz } from '../quizMapBoundary';
import { buildMapRenderModel } from './renderModel';

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
      const viewBox = mapConfig.viewBox.trim().split(/\s+/).map(Number);
      const viewportBounds = [
        viewBox[0],
        viewBox[0] + viewBox[2],
        viewBox[1],
        viewBox[1] + viewBox[3],
      ];
      for (const id of quiz.locationIds) {
        const active = generatedLocations.find(
          (location) => location.id === id,
        );
        if (!active) throw new Error(`Missing generated location ${id}`);
        const model = buildMapRenderModel({
          active,
          layer: mapLayerForQuiz(quiz, active),
          map: generatedMap,
          inset: generatedInset,
          viewportWidth: 1309,
          viewportHeight: 573,
        });
        if (!model.positionedCallout) continue;
        const [minX, maxX, minY, maxY] = viewportBounds;
        expect(model.positionedCallout.sourceCenter[0]).toBeGreaterThanOrEqual(
          minX,
        );
        expect(model.positionedCallout.sourceCenter[0]).toBeLessThanOrEqual(
          maxX,
        );
        expect(model.positionedCallout.sourceCenter[1]).toBeGreaterThanOrEqual(
          minY,
        );
        expect(model.positionedCallout.sourceCenter[1]).toBeLessThanOrEqual(
          maxY,
        );
      }
    }
  }, 30000);
});
