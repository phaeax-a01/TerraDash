import { expect, test } from '@playwright/test';

test('global high scores expose accessible score, accuracy, and time columns', async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      'terradash.high-scores.v1',
      JSON.stringify({
        version: 1,
        playerName: 'Explorer',
        scores: {
          world: [
            {
              id: 'fixture-entry',
              username: 'Explorer',
              score: 875,
              accuracy: 0.875,
              elapsedMs: 12_000,
              createdAt: 7,
            },
          ],
        },
      }),
    );
  });
  await page.goto('/TerraDash/?page=high-scores');
  const table = page.locator('.high-score-table').first();
  await expect(table.locator('thead th')).toHaveText([
    'Player',
    'Score',
    'Accuracy',
    'Time',
  ]);
  await expect(table.locator('tbody tr')).toContainText('Explorer');
  await expect(table.locator('tbody tr')).toContainText('875');
  await expect(table.locator('tbody tr')).toContainText('87.50%');
  await expect(table.locator('tbody tr')).toContainText('0:12');
  const contained = await page
    .locator('.app-footer .disclaimer')
    .evaluate((disclaimer) => {
      const footer = disclaimer.closest('.app-footer')!.getBoundingClientRect();
      const text = disclaimer.getBoundingClientRect();
      return (
        text.left >= footer.left &&
        text.right <= footer.right &&
        text.top >= footer.top &&
        text.bottom <= footer.bottom
      );
    });
  expect(contained).toBe(true);
});

for (const viewport of [
  { width: 375, height: 667 },
  { width: 1024, height: 768 },
]) {
  test(`high scores footer evidence ${viewport.width}x${viewport.height}`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize(viewport);
    await page.goto('/TerraDash/?page=high-scores');
    await expect(page.locator('.app-footer .disclaimer')).toBeVisible();
    await page.screenshot({
      path: testInfo.outputPath(
        `high-scores-${viewport.width}x${viewport.height}.png`,
      ),
      fullPage: true,
    });
  });
}
