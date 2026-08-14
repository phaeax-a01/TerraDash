import fs from 'node:fs';
const catalog = JSON.parse(fs.readFileSync('data/generated/catalog.json'));
const quiz = JSON.parse(fs.readFileSync('data/generated/quiz.json'));
const map = JSON.parse(fs.readFileSync('data/generated/map.json'));
const inset = JSON.parse(fs.readFileSync('data/generated/inset.json'));
const overrides = JSON.parse(fs.readFileSync('data/geometry-overrides.json'));
const source = JSON.parse(
  fs.readFileSync('data/source/ne_50m_admin_0_countries.geojson'),
);
const insetSource = JSON.parse(
  fs.readFileSync('data/source/ne_10m_admin_0_countries.geojson'),
);
const ids = new Set(catalog.map((item) => item.id));
if (catalog.length !== 195 || ids.size !== 195)
  throw new Error('Expected 195 unique catalog entries');
if (new Set(catalog.map((item) => item.iso3)).size !== 195)
  throw new Error('Duplicate ISO3');
if (
  quiz.locationIds.length !== 195 ||
  quiz.locationIds.some((id) => !ids.has(id))
)
  throw new Error('Quiz does not resolve to catalog');
if (map.sourceFeatureIds.length !== source.features.length)
  throw new Error('Base layer does not include every source feature');
if (new Set(map.sourceFeatureIds).size !== source.features.length)
  throw new Error('Base feature IDs are not stable and unique');
for (const [featureId, feature] of Object.entries(map.features)) {
  if (!feature.paths.length || !feature.bounds || feature.bounds.length !== 4)
    throw new Error(`Invalid base feature ${featureId}`);
  for (const path of feature.paths)
    if (!/^M[-0-9.,]+(?:L[-0-9.,]+)*Z$/.test(path))
      throw new Error(`Invalid path for ${featureId}`);
}
for (const item of catalog) {
  if (
    !item.geometryRefs.length ||
    item.geometryRefs.some((id) => !map.features[id])
  )
    throw new Error(`Missing geometry reference for ${item.id}`);
  if (!item.bounds || item.bounds.some((value) => !Number.isFinite(value)))
    throw new Error(`Missing projected bounds for ${item.id}`);
}
if (
  inset.width !== map.width ||
  inset.height !== map.height ||
  inset.sourceFeatureIds.length !== insetSource.features.length ||
  new Set(inset.sourceFeatureIds).size !== insetSource.features.length
)
  throw new Error(
    'Inset projection or feature IDs are not stable and complete',
  );
for (const item of catalog) {
  const refs = inset.locationFeatureIds[item.id];
  if (!refs?.length || refs.some((id) => !inset.features[id]))
    throw new Error(`Missing inset geometry reference for ${item.id}`);
}
for (const [featureId, feature] of Object.entries(inset.features)) {
  if (!feature.paths.length || !feature.bounds || feature.bounds.length !== 4)
    throw new Error(`Invalid inset feature ${featureId}`);
  for (const path of feature.paths)
    if (!/^M[-0-9.,]+(?:L[-0-9.,]+)*Z$/.test(path))
      throw new Error(`Invalid inset path for ${featureId}`);
}
for (const [locationId, refs] of Object.entries(overrides)) {
  if (
    !ids.has(locationId) ||
    refs.length < 2 ||
    refs.some((id) => !map.features[id])
  )
    throw new Error(`Invalid reviewed geometry override for ${locationId}`);
}
if ((overrides['iso:PSE'] ?? []).length !== 2)
  throw new Error('Expected a reviewed plural-reference observer fixture');
for (const fixture of ['iso:FRA', 'iso:USA', 'iso:FJI', 'iso:PSE', 'iso:VAT']) {
  if (!catalog.find((item) => item.id === fixture))
    throw new Error(`Missing fixture ${fixture}`);
}
console.log(
  `Data validation passed: ${catalog.length} quiz locations and ${source.features.length} base features.`,
);
