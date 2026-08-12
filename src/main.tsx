import { StrictMode, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import map from '../data/generated/map.json';
import catalog from '../data/generated/catalog.json';
import { deriveFootprint } from './footprint';
import './styles.css';

type Location = (typeof catalog)[number];
const demoIds = ['iso:FRA', 'iso:USA', 'iso:FJI', 'iso:PSE', 'iso:VAT'];
function MapView({ active }: { active: Location }) {
  const anchor = map.anchors[active.id as keyof typeof map.anchors] ?? [0, 0];
  const allPoints =
    active.id === 'iso:VAT'
      ? ([
          [anchor[0] - 1, anchor[1] - 1],
          [anchor[0] + 1, anchor[1] + 1],
        ] as [number, number][])
      : ([
          [0, 0],
          [map.width, map.height],
        ] as [number, number][]);
  const footprint = deriveFootprint(allPoints);
  return (
    <svg
      className="world-map"
      viewBox={`0 0 ${map.width} ${map.height}`}
      role="img"
      aria-label="Flat world map with the selected location highlighted"
    >
      <rect width={map.width} height={map.height} className="ocean" />
      <g className="countries">
        {Object.entries(map.paths).map(([id, paths]) => (
          <g
            key={id}
            aria-hidden="true"
            className={id === active.id ? 'country active' : 'country'}
          >
            {paths.map((path: string, index: number) => (
              <path key={index} d={path} />
            ))}
          </g>
        ))}
      </g>
      {footprint.kind === 'circle' && (
        <circle
          className="minimum-footprint"
          cx={footprint.center[0]}
          cy={footprint.center[1]}
          r={footprint.radius}
          aria-hidden="true"
        />
      )}
      <g className="active-outline" aria-hidden="true">
        {map.paths[active.id as keyof typeof map.paths].map(
          (path: string, index: number) => (
            <path key={index} d={path} />
          ),
        )}
      </g>
    </svg>
  );
}
function App() {
  const [selectedId, setSelectedId] = useState('iso:FRA');
  const active = useMemo(
    () => catalog.find((item) => item.id === selectedId) ?? catalog[0],
    [selectedId],
  );
  return (
    <main>
      <header>
        <p className="eyebrow">TERRADASH · FOUNDATION</p>
        <h1>Know the world, one place at a time.</h1>
        <p className="intro">
          A responsive map foundation for a 195-location geography quiz.
        </p>
      </header>
      <section className="demo-panel" aria-labelledby="demo-title">
        <div>
          <h2 id="demo-title">Highlight fixture</h2>
          <p id="status" aria-live="polite">
            Selected: {active.name} ({active.id})
          </p>
        </div>
        <label htmlFor="location">Location</label>
        <select
          id="location"
          value={selectedId}
          onChange={(event) => setSelectedId(event.target.value)}
        >
          {demoIds.map((id) => {
            const item = catalog.find((entry) => entry.id === id)!;
            return (
              <option key={id} value={id}>
                {item.name}
              </option>
            );
          })}
        </select>
      </section>
      <section className="map-frame">
        <MapView active={active} />
      </section>
      <p className="disclaimer">
        Map data: Natural Earth Admin 0 countries, v5.1.1, 1:50m. Public domain.
        Boundaries are shown for gameplay visualization and do not imply
        endorsement of any boundary claim.
      </p>
    </main>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
