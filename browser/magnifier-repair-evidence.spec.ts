import { expect, test } from '@playwright/test';

const cases = [
  ['MX-DIF', 'mexico-city'],
  ['MX-COL', 'colima-multipart'],
  ['US-RI', 'rhode-island-tiny'],
  ['CA-PE', 'prince-edward-island-tiny'],
  ['CA-NL', 'newfoundland-labrador-multipart'],
] as const;

for (const [location, label] of cases) {
  for (const viewport of [
    { name: 'wide', width: 1421, height: 1394 },
    { name: 'tablet', width: 768, height: 900 },
    { name: 'mobile', width: 390, height: 844 },
  ]) {
    test(`keeps ${label} magnifier centered at ${viewport.name}`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize(viewport);
      await page.goto(`/TerraDash/diagnostics.html?location=${location}`);
      const map = page.locator('.world-map');
      const callout = map.locator('.map-callout');
      if ((await callout.count()) === 0) {
        await expect(map.locator('.active-fill path')).not.toHaveCount(0);
        await page.screenshot({
          path: testInfo.outputPath(`${label}-${viewport.name}.png`),
          fullPage: true,
        });
        return;
      }
      const inset = map.locator('.callout-inset');
      await expect(inset).toBeVisible();
      const selected = inset.locator('.callout-selected path').first();
      await expect(selected).toBeVisible();
      const [insetBox, selectedBox, sourceBox] = await Promise.all([
        inset.boundingBox(),
        selected.boundingBox(),
        map.locator('.callout-source').boundingBox(),
      ]);
      expect(insetBox).not.toBeNull();
      expect(selectedBox).not.toBeNull();
      expect(sourceBox).not.toBeNull();
      expect(selectedBox!.x + selectedBox!.width).toBeGreaterThan(insetBox!.x);
      expect(selectedBox!.x).toBeLessThan(insetBox!.x + insetBox!.width);
      expect(selectedBox!.y + selectedBox!.height).toBeGreaterThan(insetBox!.y);
      expect(selectedBox!.y).toBeLessThan(insetBox!.y + insetBox!.height);
      await page.screenshot({
        path: testInfo.outputPath(`${label}-${viewport.name}.png`),
        fullPage: true,
      });
    });
  }
}
