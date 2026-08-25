import { expect, test } from '@playwright/test';

const viewports = [
  { name: 'wide', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
];

const surfaces = [
  { name: 'gameplay', path: '/TerraDash/?quiz=us-states&start=1' },
  { name: 'diagnostics', path: '/TerraDash/diagnostics.html?location=MX-DIF' },
];

for (const viewport of viewports) {
  for (const surface of surfaces) {
    test(`shared quiz layout geometry ${surface.name} ${viewport.name}`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize(viewport);
      await page.goto(surface.path);
      await expect(page.locator('.quiz-layout')).toBeVisible();

      const before = await page.evaluate(() => {
        const layout = document.querySelector<HTMLElement>('.quiz-layout')!;
        const header = layout.querySelector<HTMLElement>('.quiz-header')!;
        const status = layout.querySelector<HTMLElement>('.quiz-status-bar')!;
        const map = layout.querySelector<HTMLElement>('.map-stage')!;
        const frame = layout.querySelector<HTMLElement>('.map-frame')!;
        const layoutRect = layout.getBoundingClientRect();
        const headerRect = header.getBoundingClientRect();
        const statusRect = status.getBoundingClientRect();
        const mapRect = map.getBoundingClientRect();
        const frameRect = frame.getBoundingClientRect();
        return {
          documentHeight: document.documentElement.scrollHeight,
          layoutHeight: layoutRect.height,
          mapTop: mapRect.top,
          statusToMapGap: mapRect.top - statusRect.bottom,
          headerToMapGap: mapRect.top - headerRect.bottom,
          frameWithinMap:
            frameRect.top >= mapRect.top - 1 &&
            frameRect.bottom <= mapRect.bottom + 1,
          visualViewportHeight: window.visualViewport?.height ?? null,
          innerHeight: window.innerHeight,
          activeHeight: getComputedStyle(
            document.querySelector<HTMLElement>('main.app-shell')!,
          ).getPropertyValue('--active-quiz-height'),
          structure: {
            layout: [...layout.classList]
              .filter((name) => !name.startsWith('attempts-remaining-'))
              .join(' '),
            header: header.className,
            stage: map.className,
            frame: frame.className,
          },
        };
      });

      expect(before.structure).toEqual({
        layout: 'player-card active-player quiz-layout',
        header: 'quiz-header',
        stage: 'map-stage',
        frame: 'map-frame',
      });
      expect(before.frameWithinMap).toBe(true);
      expect(before.documentHeight).toBeGreaterThanOrEqual(viewport.height);

      const answer = page.locator('#answer');
      if (await answer.count()) {
        await answer.focus();
        await page.keyboard.type('a');
      }
      const afterKeyboard = await page.evaluate(() => ({
        documentHeight: document.documentElement.scrollHeight,
        mapTop: document
          .querySelector<HTMLElement>('.map-stage')!
          .getBoundingClientRect().top,
        visualViewportHeight: window.visualViewport?.height ?? null,
      }));
      expect(afterKeyboard.documentHeight).toBe(before.documentHeight);
      expect(afterKeyboard.mapTop).toBeCloseTo(before.mapTop, 0);

      await testInfo.attach('geometry.json', {
        body: JSON.stringify(
          { viewport, surface, before, afterKeyboard },
          null,
          2,
        ),
        contentType: 'application/json',
      });
      await page.screenshot({
        path: testInfo.outputPath(
          `shared-layout-${surface.name}-${viewport.name}.png`,
        ),
        fullPage: true,
      });
    });
  }
}
