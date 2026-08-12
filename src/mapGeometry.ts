import map from '../data/generated/map.json';

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
