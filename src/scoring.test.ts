import { describe, expect, it } from 'vitest';
import {
  calculateFinalScore,
  calculateFinalScoreFromWeightedCredit,
} from './scoring';

describe('calculateFinalScore', () => {
  it.each([
    [5000, 1800, 0],
    [10000, 3600, 0],
    [10000, 0, 10000],
    [9912, 927, 7337],
  ])(
    'calculates %s accuracy hundredths at %s seconds as %s',
    (accuracyHundredths, elapsedSeconds, expected) => {
      expect(calculateFinalScore(accuracyHundredths, elapsedSeconds)).toBe(
        expected,
      );
    },
  );

  it('clamps negative scores and rounds positive fractions half up', () => {
    expect(calculateFinalScore(0, 1)).toBe(0);
    expect(calculateFinalScore(10000, 1)).toBe(9997);
    expect(calculateFinalScore(10000, 2)).toBe(9994);
  });

  it('retains exact quarter-point accuracy when deriving from quiz credit', () => {
    expect(calculateFinalScoreFromWeightedCredit(1, 2, 1800 * 1000)).toBe(0);
    expect(calculateFinalScoreFromWeightedCredit(2, 3, 0)).toBe(6667);
  });
});
