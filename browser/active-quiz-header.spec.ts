import { expect, test } from '@playwright/test';

for (const fixture of [
  { id: 'asia', name: 'Asia UN Countries', width: 886, height: 588 },
  {
    id: 'non-un',
    name: 'Non-UN Countries, Independent Territories, and Autonomous Regions',
    width: 1024,
    height: 768,
  },
  {
    id: 'non-un',
    name: 'Non-UN Countries, Independent Territories, and Autonomous Regions',
    width: 375,
    height: 667,
  },
]) {
  test(`active ${fixture.id} subheader remains readable at ${fixture.width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({
      width: fixture.width,
      height: fixture.height,
    });
    await page.goto(`/TerraDash/?quiz=${fixture.id}&start=1`);
    await expect(page.locator('.active-player')).toBeVisible();
    await expect(page.locator('.quiz-name')).toHaveText(fixture.name);
    const bounds = await page.evaluate(() => {
      const header = document.querySelector<HTMLElement>(
        '.active-player .quiz-header',
      )!;
      const prompt = document.querySelector<HTMLElement>(
        '.active-player .quiz-prompt-group',
      )!;
      const status = document.querySelector<HTMLElement>(
        '.active-player .quiz-status-bar',
      )!;
      const map = document.querySelector<HTMLElement>('.map-stage')!;
      const h = header.getBoundingClientRect();
      const p = prompt.getBoundingClientRect();
      const s = status.getBoundingClientRect();
      return {
        promptInside:
          p.left >= h.left &&
          p.right <= h.right &&
          p.top >= h.top &&
          p.bottom <= h.bottom,
        statusInside:
          s.left >= h.left &&
          s.right <= h.right &&
          s.top >= h.top &&
          s.bottom <= h.bottom,
        promptStatusSeparate:
          p.bottom <= s.top ||
          s.bottom <= p.top ||
          p.right <= s.left ||
          s.right <= p.left,
        headerMapSeparate: h.bottom <= map.getBoundingClientRect().top,
        horizontalOverflow:
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      };
    });
    expect(bounds).toEqual({
      promptInside: true,
      statusInside: true,
      promptStatusSeparate: true,
      headerMapSeparate: true,
      horizontalOverflow: true,
    });
    await page.screenshot({
      path: testInfo.outputPath(
        `active-${fixture.id}-${fixture.width}x${fixture.height}.png`,
      ),
      fullPage: true,
    });
  });
}
