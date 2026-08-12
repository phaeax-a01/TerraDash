# TerraDash

TerraDash is a geography quiz game. The foundation slice is a React/TypeScript/Vite shell with a reproducibly generated, flat equirectangular Natural Earth world map.

## Development

```sh
npm ci
npm run generate
npm run validate:data
npm run dev
npm run format
npm run lint
npm test
npm run build
```

Vite is configured for the GitHub Pages base path `/TerraDash/`. The demo selector highlights ordinary, multipart/remote, island, observer, and microstate fixtures. It is intentionally not quiz gameplay.

## Data and architecture

`data/source/ne_50m_admin_0_countries.geojson` is Natural Earth Admin 0 countries, v5.1.1, 1:50m, pinned by SHA-256 in the generated manifest. Natural Earth data is public domain. The map uses a neutral disclaimer because boundary representations do not imply endorsement of any boundary claim.

`scripts/generate-map.mjs` is the build-time boundary between source geography and render artifacts. It projects to a 1440×720 equirectangular SVG coordinate system, applies deterministic simplification, writes plural geometry references, and emits the 195-location catalog and predefined quiz definition. Generated files live in `data/generated`; do not hand-edit them. Update the dataset by replacing the pinned source, updating its checksum through a reviewed generator run, and checking the deterministic diff.

The renderer preserves true paths and derives a screen-space minimum footprint only when the projected highlight is below `MIN_FOOTPRINT_PX`. The same footprint contract is available for future interaction, but v0 has no map-click gameplay.

## Provenance

Natural Earth: <https://www.naturalearthdata.com/>; source product: <https://github.com/nvkelso/natural-earth-vector/tree/v5.1.1/geojson>.
