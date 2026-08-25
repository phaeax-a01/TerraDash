// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { QuizLayout } from './QuizLayout';

let root: ReturnType<typeof createRoot> | undefined;

afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
  document.body.replaceChildren();
});

describe('QuizLayout shared production boundary', () => {
  it('gives gameplay and diagnostics the same structural layout slots', () => {
    const host = document.createElement('main');
    document.body.append(host);
    root = createRoot(host);

    act(() =>
      root!.render(
        <>
          <QuizLayout
            prompt={<h1>Gameplay prompt</h1>}
            status={<span>Gameplay status</span>}
            content={<svg aria-label="gameplay map" />}
            stageOverlay={<div data-testid="gameplay-overlay" />}
          />
          <QuizLayout
            prompt={<h1>Diagnostics prompt</h1>}
            status={<span>Diagnostics status</span>}
            content={<svg aria-label="diagnostics map" />}
            headerOverlay={<button type="button">Inspect</button>}
          />
        </>,
      ),
    );

    const layouts = [...host.querySelectorAll('.quiz-layout')];
    expect(layouts).toHaveLength(2);
    expect(
      layouts.map((layout) => [
        layout.className,
        layout.querySelector('.quiz-header')?.className,
        layout.querySelector('.map-stage')?.className,
        layout.querySelector('.map-frame')?.className,
      ]),
    ).toEqual([
      [
        'player-card active-player quiz-layout',
        'quiz-header',
        'map-stage',
        'map-frame',
      ],
      [
        'player-card active-player quiz-layout',
        'quiz-header',
        'map-stage',
        'map-frame',
      ],
    ]);
    expect(host.querySelector('[data-testid="gameplay-overlay"]')).toBeTruthy();
    expect(host.querySelector('.map-header-overlay button')?.textContent).toBe(
      'Inspect',
    );
  });
});
