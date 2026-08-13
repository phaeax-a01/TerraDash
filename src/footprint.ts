export type Point = [number, number];
export type Footprint = {
  kind: 'polygon' | 'circle';
  points?: Point[];
  center: Point;
  radius: number;
};
export const MIN_FOOTPRINT_PX = 10;
export function pathPoints(paths: string[]): Point[] {
  return paths.flatMap((path) =>
    [...path.matchAll(/[ML](-?[\d.]+),(-?[\d.]+)/g)].map(([, x, y]) => [
      +x,
      +y,
    ]),
  );
}
export function unwrapComponent(points: Point[], width: number): Point[] {
  if (points.length < 2) return points;
  const xs = [...new Set(points.map(([x]) => x))].sort((a, b) => a - b);
  let largestGap = -1;
  let start = xs[0];
  for (let i = 0; i < xs.length; i++) {
    const next = i + 1 < xs.length ? xs[i + 1] : xs[0] + width;
    if (next - xs[i] > largestGap) {
      largestGap = next - xs[i];
      start = next % width;
    }
  }
  return points.map(([x, y]) => [x < start ? x + width : x, y]);
}
export function componentSpan(path: string, width: number): number {
  return Math.max(
    ...pathPointComponents(path, width).map((points) => {
      const xs = points.map(([x]) => x);
      const ys = points.map(([, y]) => y);
      const sorted = [...new Set(xs)].sort((a, b) => a - b);
      const largestGap = Math.max(
        ...sorted.map((x, index) => {
          const next = sorted[index + 1] ?? sorted[0] + width;
          return next - x;
        }),
      );
      return Math.max(width - largestGap, Math.max(...ys) - Math.min(...ys));
    }),
    0,
  );
}
export function pathPointComponents(path: string, width: number): Point[][] {
  const components: Point[][] = [[]];
  for (const point of pathPoints([path])) {
    const previous = components.at(-1)!.at(-1);
    if (previous && Math.abs(point[0] - previous[0]) > width / 2)
      components.push([]);
    components.at(-1)!.push(point);
  }
  return components.filter((points) => points.length > 0);
}
export function deriveComponentFootprints(
  paths: string[],
  scale: number,
  width: number,
  threshold = MIN_FOOTPRINT_PX,
): Footprint[] {
  return paths.flatMap((path) =>
    pathPointComponents(path, width).map((component) => {
      const points = unwrapComponent(component, width);
      return deriveFootprint(
        points.map(([x, y]) => [x * scale, y * scale]),
        threshold,
      );
    }),
  );
}
export function deriveFootprint(
  points: Point[],
  threshold = MIN_FOOTPRINT_PX,
): Footprint {
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const center: Point = [(minX + maxX) / 2, (minY + maxY) / 2];
  const radius = Math.max(maxX - minX, maxY - minY) / 2;
  return radius * 2 >= threshold
    ? { kind: 'polygon', points, center, radius }
    : { kind: 'circle', center, radius: threshold / 2 };
}
