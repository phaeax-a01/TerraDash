import { expect, test } from '@playwright/test';
import catalog from '../data/generated/catalog.json';
import candidates from '../data/generated/non-un-candidates.json';

test('Diagnostics exposes the complete standard and Non-UN location union', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto('/TerraDash/diagnostics.html');
  const selector = page.getByRole('combobox', { name: 'Location' });
  await expect(selector.locator('option')).toHaveCount(
    catalog.length + candidates.length,
  );
  await expect(selector.locator('option')).toHaveCount(
    new Set([...catalog, ...candidates].map(({ id }) => id)).size,
  );

  for (const [id, name] of [
    [candidates[0].id, candidates[0].name],
    ['non-un:adjara', 'Adjara'],
  ] as const) {
    await selector.selectOption(id);
    await expect(selector).toHaveValue(id);
    await expect(page.locator('.world-map')).toBeVisible();
    await expect(page.locator('.world-map path')).not.toHaveCount(0);
    await expect(page.getByText(name, { exact: true })).toBeVisible();
  }
  await expect(page.locator('.callout-source')).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath('diagnostics-custom-adjara.png'),
    fullPage: true,
  });
});
