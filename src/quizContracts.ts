import catalogData from '../data/generated/catalog.json';
import quizData from '../data/generated/quiz.json';
import quizzesData from '../data/quizzes.json';
import candidateData from '../data/generated/non-un-candidates.json';
import usStateData from '../data/generated/us-states.json';
import map from '../data/generated/map.json';
import type { CatalogLocation, QuizDefinition } from './quizEngine';
import { highlightedGeometryPaths } from './mapGeometry';

export type MapLayerConfig = {
  contextFeatureIds: readonly string[];
  baseLayers: readonly { id: string; paths: string[] }[];
  wrapActive: boolean;
  viewBox: string;
  selectable: boolean;
};

export type MapLayer = MapLayerConfig & { activePaths: string[] };

const defaultMapLayer: MapLayerConfig = {
  contextFeatureIds: map.sourceFeatureIds,
  baseLayers: [],
  wrapActive: true,
  viewBox: '',
  selectable: false,
};

export const mapLayerConfigs: Record<string, MapLayerConfig> = {
  'us-states': {
    contextFeatureIds: map.sourceFeatureIds.filter(
      (id) => id !== 'ne:1159321369',
    ),
    baseLayers: usStateData.map((state) => ({
      id: state.id,
      paths: highlightedGeometryPaths(state.geometryRefs),
    })),
    wrapActive: false,
    viewBox: '10 35 500 295',
    selectable: true,
  },
};

const locationMapLayers: Record<string, MapLayerConfig> = Object.fromEntries(
  usStateData.map((state) => [state.id, mapLayerConfigs['us-states']]),
);

export function mapLayerForQuiz(
  quizId: string,
  active: { geometryRefs: string[] },
): MapLayer {
  const config = mapLayerConfigs[quizId] ?? defaultMapLayer;
  return {
    ...config,
    activePaths: highlightedGeometryPaths(active.geometryRefs),
  };
}

export function mapLayerForLocation(active: {
  id: string;
  geometryRefs: string[];
}): MapLayer {
  const config = locationMapLayers[active.id] ?? defaultMapLayer;
  return {
    ...config,
    activePaths: highlightedGeometryPaths(active.geometryRefs),
  };
}

export const defaultCatalog: CatalogLocation[] = catalogData.map(
  ({ id, name }) => ({
    id,
    name,
  }),
);

export const candidateCatalog: CatalogLocation[] = candidateData.map(
  ({ id, name }) => ({
    id,
    name,
  }),
);

export const usStateCatalog: CatalogLocation[] = usStateData.map(
  ({ id, name }) => ({
    id,
    name,
  }),
);

export const playableLocations = [
  ...catalogData,
  ...candidateData,
  ...usStateData,
];

export const defaultQuiz: QuizDefinition = {
  id: quizData.id,
  locationIds: [...quizData.locationIds],
};

export type QuizOption = QuizDefinition & {
  name: string;
  description?: string;
  category?: 'regional';
};

const catalogByIso3 = new Map(
  catalogData.map((location) => [location.iso3, location]),
);
type QuizInput = {
  id: string;
  name: string;
  description?: string;
  category?: 'regional';
} & (
  | { candidateSet: 'non-un'; locationIso3?: never; locationIds?: never }
  | {
      stateSet: 'us-states';
      candidateSet?: never;
      locationIso3?: never;
      locationIds?: never;
    }
  | { locationIds: string[]; candidateSet?: never; locationIso3?: never }
  | { locationIso3: string[]; candidateSet?: never; locationIds?: never }
);

export const quizOptions: QuizOption[] = (quizzesData as QuizInput[]).map(
  (quiz): QuizOption => {
    const locationIds =
      quiz.candidateSet === 'non-un'
        ? candidateData.map(({ id }) => id)
        : 'stateSet' in quiz && quiz.stateSet === 'us-states'
          ? usStateData.map(({ id }) => id)
          : 'locationIds' in quiz
            ? (quiz.locationIds ?? [])
            : (quiz.locationIso3 ?? []).map((iso3) => {
                const location = catalogByIso3.get(iso3);
                if (!location)
                  throw new Error(
                    `Quiz location is absent from catalog: ${iso3}`,
                  );
                return location.id;
              });
    return {
      id: quiz.id,
      name: quiz.name,
      description: quiz.description,
      category: quiz.category,
      locationIds,
    };
  },
);

export const worldQuiz = quizOptions[0];
