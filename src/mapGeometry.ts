import map from '../data/generated/map.json';
import inset from '../data/generated/inset.json';

export function baseGeometryPaths(): string[] {
  return map.sourceFeatureIds.flatMap(
    (id) => map.features[id as keyof typeof map.features].paths,
  );
}

export function highlightedGeometryPaths(refs: string[]): string[] {
  return refs.flatMap(
    (id) => map.features[id as keyof typeof map.features].paths,
  );
}

export function insetGeometryPaths(locationId: string): string[] {
  const refs =
    inset.locationFeatureIds[
      locationId as keyof typeof inset.locationFeatureIds
    ];
  if (!refs?.length)
    throw new Error(`Missing inset geometry for ${locationId}`);
  return refs.flatMap(
    (id) => inset.features[id as keyof typeof inset.features].paths,
  );
}
