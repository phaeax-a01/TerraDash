export type ResultMood = {
  emoji: string;
  label: string;
  description: string;
};

/** Keeps celebration language deterministic without changing score calculation. */
export function resultMoodForScore(finalScore: number): ResultMood {
  if (finalScore >= 7500)
    return {
      emoji: '🥳',
      label: 'Celebration',
      description: 'Outstanding run',
    };
  if (finalScore >= 5000)
    return {
      emoji: '😊',
      label: 'Great work',
      description: 'A strong run',
    };
  if (finalScore >= 2500)
    return {
      emoji: '🙂',
      label: 'Keep going',
      description: 'You are building momentum',
    };
  return {
    emoji: '💪',
    label: 'Keep practicing',
    description: 'Every run is progress',
  };
}
