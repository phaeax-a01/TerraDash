import fs from 'node:fs';
const catalog = JSON.parse(fs.readFileSync('data/generated/catalog.json'));
const quiz = JSON.parse(fs.readFileSync('data/generated/quiz.json'));
const map = JSON.parse(fs.readFileSync('data/generated/map.json'));
const ids = new Set(catalog.map((item) => item.id));
if (catalog.length !== 195 || ids.size !== 195)
  throw new Error(`Expected 195 unique catalog entries, got ${catalog.length}`);
const iso = catalog.map((item) => item.iso3);
if (new Set(iso).size !== iso.length) throw new Error('Duplicate ISO3');
if (
  quiz.locationIds.length !== 195 ||
  quiz.locationIds.some((id) => !ids.has(id))
)
  throw new Error('Quiz does not resolve to catalog');
for (const item of catalog) {
  if (
    !item.geometryRefs.length ||
    item.geometryRefs.some((id) => !map.paths[id]?.length)
  )
    throw new Error(`Missing geometry for ${item.id}`);
  for (const path of map.paths[item.id])
    if (!/^M[-0-9.,]+(?:L[-0-9.,]+)*Z$/.test(path))
      throw new Error(`Invalid path for ${item.id}`);
}
console.log(
  'Data validation passed: 195 unique quiz IDs, ISO3 values, references, and finite nonempty paths.',
);
