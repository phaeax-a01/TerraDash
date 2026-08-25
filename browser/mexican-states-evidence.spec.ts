import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

const quizzes = JSON.parse(
  readFileSync(new URL('../data/quizzes.json', import.meta.url), 'utf8'),
);
const locations = JSON.parse(
  readFileSync(
    new URL('../data/generated/locations.json', import.meta.url),
    'utf8',
  ),
);
const mexico = quizzes.find(
  (quiz: { id: string }) => quiz.id === 'mexican-states',
);

test.describe('disposable Mexican States evidence', () => {
  for (const viewport of [
    { name: 'wide', width: 1440, height: 900 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'mobile', width: 390, height: 844 },
  ]) {
    test(`full regional map and retained context at ${viewport.name}`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize(viewport);
      await page.goto(
        '/TerraDash/diagnostics.html?quiz=mexican-states&location=MX-BCN',
      );
      const map = page.locator('.world-map');
      await expect(map).toHaveAttribute('viewBox', mexico.map.viewBox);
      await expect(map).toHaveAttribute('preserveAspectRatio', 'xMidYMid meet');
      const mapBox = await map.boundingBox();
      expect(mapBox).not.toBeNull();
      const target = map
        .locator('.active-fill path[data-location-id="MX-BCN"]')
        .first();
      await expect(target).toHaveAttribute('aria-label', 'Baja California');
      const targetBox = await target.boundingBox();
      expect(targetBox).not.toBeNull();
      expect(targetBox!.x).toBeGreaterThanOrEqual(mapBox!.x - 1);
      expect(targetBox!.x + targetBox!.width).toBeLessThanOrEqual(
        mapBox!.x + mapBox!.width + 1,
      );
      expect(targetBox!.y).toBeGreaterThanOrEqual(mapBox!.y - 1);
      expect(targetBox!.y + targetBox!.height).toBeLessThanOrEqual(
        mapBox!.y + mapBox!.height + 1,
      );
      await expect(
        map.locator('[data-feature-id="ne:1159321055"]'),
      ).toHaveCount(1);
      const overflow = await page.evaluate(() => ({
        width: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight,
        viewportWidth: innerWidth,
        viewportHeight: innerHeight,
      }));
      expect(overflow.width).toBeLessThanOrEqual(overflow.viewportWidth);
      expect(overflow.height).toBeLessThanOrEqual(overflow.viewportHeight);
      await page.screenshot({
        path: testInfo.outputPath(`mexico-full-${viewport.name}.png`),
        fullPage: true,
      });
    });
  }

  for (const [id, name] of [
    ['MX-BCS', 'Baja California Sur'],
    ['MX-ROO', 'Quintana Roo'],
  ]) {
    test(`captures ${name} coastal geometry at mobile`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(
        `/TerraDash/diagnostics.html?quiz=mexican-states&location=${id}`,
      );
      const target = page.locator(
        `.active-fill path[data-location-id="${id}"]`,
      );
      await expect(target.first()).toHaveAttribute('aria-label', name);
      const location = locations.find(
        (candidate: { id: string }) => candidate.id === id,
      );
      expect(location.geometryRefs.length).toBeGreaterThan(0);
      await expect(target.first()).toBeVisible();
      await page.screenshot({
        path: testInfo.outputPath(`mexico-${id.toLowerCase()}-mobile.png`),
        fullPage: true,
      });
    });
  }

  test('captures Mexico City small-area magnifier behavior', async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(
      '/TerraDash/diagnostics.html?quiz=mexican-states&location=MX-DIF',
    );
    await expect(
      page.locator('.active-fill path[data-location-id="MX-DIF"]').first(),
    ).toHaveAttribute('aria-label', 'Mexico City');
    await expect(page.locator('.map-callout')).toBeVisible();
    await expect(page.locator('.callout-selected')).toBeVisible();
    await page.screenshot({
      path: testInfo.outputPath('mexico-city-magnifier-mobile.png'),
      fullPage: true,
    });
  });

  test('answers and advances the authored Mexican quiz', async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/TerraDash/?quiz=mexican-states&start=1');
    const target = page.locator('.active-fill path[data-location-id]').first();
    const answer = await target.getAttribute('aria-label');
    expect(answer).toBeTruthy();
    await page.getByRole('combobox', { name: 'Location name' }).fill(answer!);
    await page.getByRole('button', { name: 'Submit answer' }).click();
    await expect(page.locator('.status-correct strong')).toHaveText('1/1');
    await expect(page.locator('.status-remaining strong')).toHaveText('31');
    await page.screenshot({
      path: testInfo.outputPath('mexico-answer-advance.png'),
      fullPage: true,
    });
  });
});
