import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

const locations = JSON.parse(
  readFileSync(
    new URL('../data/generated/locations.json', import.meta.url),
    'utf8',
  ),
);

test('diagnostics uses the shared quiz player and scopes its controls', async ({
  page,
}) => {
  await page.goto(
    '/TerraDash/diagnostics.html?quiz=non-un&location=non-un:abkhazia',
  );
  const controls = page.locator('.diagnostics-controls');
  const quizSelect = controls.locator('#diagnostic-quiz');
  const locationSelect = controls.locator('#diagnostic-location');
  await expect(quizSelect).toHaveValue('non-un');
  await expect(locationSelect).toHaveValue('non-un:abkhazia');
  await expect(locationSelect.locator('option')).toHaveCount(89);
  await expect(page.locator('#answer')).toBeVisible();
  await expect(page.locator('.active-fill path')).not.toHaveCount(0);
  await expect(page.locator('.callout-selected path')).not.toHaveCount(0);

  const firstLocation = await locationSelect.inputValue();
  const nextLocation = await locationSelect
    .locator('option')
    .nth(1)
    .getAttribute('value');
  await locationSelect.selectOption(nextLocation!);
  await expect(locationSelect).toHaveValue(nextLocation!);
  await expect(locationSelect).not.toHaveValue(firstLocation);

  await page
    .locator('#answer')
    .fill((await locationSelect.locator('option:checked').textContent()) ?? '');
  await page.locator('#answer').press('Enter');
  await expect(locationSelect).not.toHaveValue(nextLocation!);

  await quizSelect.selectOption('us-states');
  await expect(quizSelect).toHaveValue('us-states');
  await expect(locationSelect.locator('option')).toHaveCount(51);
  await quizSelect.selectOption('non-un');
  await expect(locationSelect.locator('option')).toHaveCount(89);

  await page.evaluate(() =>
    localStorage.setItem('terradash.high-scores.v1', '{"sentinel":true}'),
  );
  await controls.getByRole('button', { name: 'End Quiz' }).click();
  await expect(page.locator('.quiz-results')).toBeVisible();
  await expect(page.locator('.high-score-panel')).toHaveCount(0);
  const storedScores = await page.evaluate(() =>
    localStorage.getItem('terradash.high-scores.v1'),
  );
  expect(storedScores).toBe('{"sentinel":true}');
});
