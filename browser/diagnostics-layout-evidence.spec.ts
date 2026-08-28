import { expect, test } from '@playwright/test';

for (const viewport of [
  { name: 'reported-wide', width: 801, height: 219 },
  { name: 'reported-narrow', width: 645, height: 195 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 667 },
]) {
  test(`captures contained diagnostics layout at ${viewport.name}`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize(viewport);
    await page.goto('/TerraDash/diagnostics.html?quiz=non-un');
    await expect(page.locator('.diagnostics-controls')).toBeVisible();
    const bounds = await page.evaluate(() => {
      const header = document.querySelector<HTMLElement>('.quiz-header')!;
      const prompt = document.querySelector<HTMLElement>('.quiz-prompt-group')!;
      const status = document.querySelector<HTMLElement>('.quiz-status-bar')!;
      const controls = document.querySelector<HTMLElement>(
        '.diagnostics-controls',
      )!;
      const rect = (element: HTMLElement) => element.getBoundingClientRect();
      const h = rect(header);
      const p = rect(prompt);
      const s = rect(status);
      const c = rect(controls);
      const overlaps = (a: DOMRect, b: DOMRect) =>
        a.left < b.right &&
        a.right > b.left &&
        a.top < b.bottom &&
        a.bottom > b.top;
      return {
        promptControlsOverlap: overlaps(p, c),
        statusControlsOverlap: overlaps(s, c),
        controlsInsideHeader:
          c.left >= h.left &&
          c.right <= h.right &&
          c.top >= h.top &&
          c.bottom <= h.bottom,
        horizontalOverflow:
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      };
    });
    expect(bounds.controlsInsideHeader).toBe(true);
    expect(bounds.horizontalOverflow).toBe(true);
    if (viewport.width > 620) {
      expect(bounds.promptControlsOverlap).toBe(false);
      expect(bounds.statusControlsOverlap).toBe(false);
    }
    await page.screenshot({
      path: testInfo.outputPath(`diagnostics-layout-${viewport.name}.png`),
      fullPage: true,
    });
  });
}
