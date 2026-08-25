import { expect, test } from '@playwright/test';

const cases = [
  ['MX-COL', 'colima'],
  ['MX-BCS', 'baja-california-sur'],
  ['MX-ROO', 'quintana-roo'],
] as const;

for (const viewport of [
  { name: 'wide', width: 1905, height: 952 },
  { name: 'mobile', width: 390, height: 844 },
]) {
  for (const [locationId, slug] of cases) {
    test(`captures ${locationId} fidelity at ${viewport.name}`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize(viewport);
      await page.goto(`/TerraDash/diagnostics.html?location=${locationId}`);

      const map = page.locator('.world-map');
      await expect(map).toHaveAttribute('viewBox', '198 216 224 98');
      const selected = map.locator(
        `.active-fill path[data-location-id="${locationId}"]`,
      );
      await expect(selected.first()).toBeVisible();
      const mainPaths = await selected.evaluateAll((paths) =>
        paths.map((path) => path.getAttribute('d') ?? ''),
      );
      const vertexCount = mainPaths.reduce(
        (count, path) => count + (path.match(/[ML]/g)?.length ?? 0),
        0,
      );
      expect(vertexCount, `${locationId} main vertices`).toBeGreaterThan(0);

      if (locationId === 'MX-COL') expect(vertexCount).toBeGreaterThan(20);
      if (viewport.name === 'mobile')
        await expect(
          map.locator('.callout-selected path').first(),
        ).toBeVisible();

      await page.screenshot({
        path: testInfo.outputPath(`${slug}-${viewport.name}.png`),
        fullPage: true,
      });
    });
  }
}
