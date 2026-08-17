const CREDIT_UNITS_PER_POINT = 4n;
const HUNDREDTHS_PER_POINT = 10000n;
const HUNDREDTHS_PER_CREDIT_UNIT =
  HUNDREDTHS_PER_POINT / CREDIT_UNITS_PER_POINT;
const PENALTY_NUMERATOR = 25n;
const PENALTY_DENOMINATOR = 9n;

function roundNonnegativeHalfUp(numerator: bigint, denominator: bigint): number {
  if (numerator <= 0n) return 0;
  return Number((2n * numerator + denominator) / (2n * denominator));
}

function decimalRational(value: number): [bigint, bigint] {
  const text = String(value);
  const [whole, fraction = ''] = text.split('.');
  const digits = `${whole}${fraction}`;
  return [BigInt(digits), 10n ** BigInt(fraction.length)];
}

/** Calculates a final score from accuracy hundredths and whole seconds. */
export function calculateFinalScore(
  accuracyHundredths: number,
  elapsedWholeSeconds: number,
): number {
  if (!Number.isFinite(accuracyHundredths) || accuracyHundredths < 0)
    throw new RangeError('Accuracy hundredths must be nonnegative and finite');
  if (!Number.isInteger(elapsedWholeSeconds) || elapsedWholeSeconds < 0)
    throw new RangeError('Elapsed seconds must be a nonnegative integer');
  const [accuracyNumerator, accuracyDenominator] = decimalRational(
    accuracyHundredths,
  );
  const numerator =
    accuracyNumerator * PENALTY_DENOMINATOR -
    BigInt(elapsedWholeSeconds) * PENALTY_NUMERATOR * accuracyDenominator;
  const denominator = PENALTY_DENOMINATOR * accuracyDenominator;
  return roundNonnegativeHalfUp(numerator, denominator);
}

/** Calculates a final score while retaining exact quarter-point accuracy. */
export function calculateFinalScoreFromWeightedCredit(
  weightedCredit: number,
  totalLocations: number,
  elapsedMs: number,
): number {
  if (!Number.isInteger(totalLocations) || totalLocations <= 0)
    throw new RangeError('Total locations must be a positive integer');
  if (!Number.isFinite(weightedCredit) || weightedCredit < 0)
    throw new RangeError('Weighted credit must be a nonnegative finite number');
  if (!Number.isFinite(elapsedMs) || elapsedMs < 0)
    throw new RangeError('Elapsed time must be a nonnegative finite number');
  const creditUnits = BigInt(
    Math.round(weightedCredit * Number(CREDIT_UNITS_PER_POINT)),
  );
  const total = BigInt(totalLocations);
  const elapsedSeconds = BigInt(Math.floor(elapsedMs / 1000));
  const numerator =
    creditUnits * HUNDREDTHS_PER_CREDIT_UNIT * PENALTY_DENOMINATOR -
    elapsedSeconds * PENALTY_NUMERATOR * total;
  return roundNonnegativeHalfUp(numerator, PENALTY_DENOMINATOR * total);
}
