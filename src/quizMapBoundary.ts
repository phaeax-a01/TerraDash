import catalog from '../data/generated/catalog.json';
import candidates from '../data/generated/non-un-candidates.json';
import usStates from '../data/generated/us-states.json';
import map from '../data/generated/map.json';
import { highlightedGeometryPaths } from './mapGeometry';

export const US_STATES_VIEW_BOX = '10 35 500 295';

export type MapLayer = {
  contextFeatureIds: readonly string[];
  baseLayers: readonly { id: string; paths: string[] }[];
  activePaths: string[];
  wrapActive: boolean;
  viewBox: string;
  selectable: boolean;
};

export function isUsStatesLocation(id: string): boolean {
  return /^US-[A-Z]{2}$/.test(id);
}

export function mapLayerForLocation(
  active: RenderLocation,
  quizId?: string,
): MapLayer {
  const isStatesLayer = quizId === 'us-states' || isUsStatesLocation(active.id);
  return isStatesLayer
    ? {
        contextFeatureIds: map.sourceFeatureIds.filter(
          (id) => id !== 'ne:1159321369',
        ),
        baseLayers: usStates.map((state) => ({
          id: state.id,
          paths: highlightedGeometryPaths(state.geometryRefs),
        })),
        activePaths: highlightedGeometryPaths(active.geometryRefs),
        wrapActive: false,
        viewBox: US_STATES_VIEW_BOX,
        selectable: true,
      }
    : {
        contextFeatureIds: map.sourceFeatureIds,
        baseLayers: [],
        activePaths: highlightedGeometryPaths(active.geometryRefs),
        wrapActive: true,
        viewBox: '',
        selectable: false,
      };
}

export function mapViewBoxForQuiz(
  quizId: string | undefined,
  locationId: string,
): string | undefined {
  return quizId === 'us-states' || isUsStatesLocation(locationId)
    ? US_STATES_VIEW_BOX
    : undefined;
}

export type RenderLocation = {
  id: string;
  name: string;
  geometryRefs: string[];
  anchor: number[];
  bounds: number[];
};

export function mapLocationForQuizId(id: string): RenderLocation | undefined {
  const location =
    catalog.find((location) => location.id === id) ??
    candidates.find((location) => location.id === id) ??
    usStates.find((location) => location.id === id);
  return location;
}
