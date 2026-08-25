import { describe, expect, it } from 'vitest';
import { resultMoodForScore } from './resultMood';

describe('resultMoodForScore', () => {
  it.each([
    [0, '💪'],
    [2499, '💪'],
    [2500, '🙂'],
    [4999, '🙂'],
    [5000, '😊'],
    [7499, '😊'],
    [7500, '🥳'],
  ])('selects the tier at score %s', (score, emoji) => {
    expect(resultMoodForScore(score).emoji).toBe(emoji);
  });
});
