import { describe, expect, it } from 'vitest';
import { suggestionsFor } from './autocomplete';

const catalog = [
  { id: 'a', name: 'Alpha' },
  { id: 'b', name: 'Bravo' },
  { id: 'c', name: 'Alpine' },
  { id: 'd', name: 'Albatross' },
];

describe('autocomplete suggestions', () => {
  it('filters case-insensitively and puts an exact match first', () => {
    expect(suggestionsFor(catalog, ' alpine')).toEqual([
      { id: 'c', name: 'Alpine' },
    ]);
    expect(suggestionsFor(catalog, 'alpha')[0].id).toBe('a');
  });
  it('limits visible results without hiding an exact match', () => {
    expect(suggestionsFor(catalog, 'a', 2)).toHaveLength(2);
    expect(suggestionsFor(catalog, 'bravo', 1)).toEqual([
      { id: 'b', name: 'Bravo' },
    ]);
  });
  it('uses deterministic catalog ordering for empty input', () => {
    expect(suggestionsFor(catalog, '', 3).map(({ id }) => id)).toEqual([
      'a',
      'b',
      'c',
    ]);
  });
  it('uses the shared key for accents and punctuation without changing labels', () => {
    const localized = [{ id: 'x', name: 'Côte d’Ivoire' }];
    expect(suggestionsFor(localized, "cote d'ivoire")).toEqual(localized);
    expect(suggestionsFor(localized, "cote d'ivoire")[0].name).toBe(
      'Côte d’Ivoire',
    );
    expect(suggestionsFor(localized, 'cote divoire')).toEqual(localized);
    expect(suggestionsFor(localized, 'cote ivoire')).toEqual([]);
  });
  it('supports a catalog already scoped to the active quiz', () => {
    const regionalCatalog = catalog.filter(({ id }) => id !== 'b');
    expect(suggestionsFor(regionalCatalog, 'br')).toEqual([]);
    expect(suggestionsFor(regionalCatalog, 'al')).toEqual([
      { id: 'd', name: 'Albatross' },
      { id: 'a', name: 'Alpha' },
      { id: 'c', name: 'Alpine' },
    ]);
  });
});
