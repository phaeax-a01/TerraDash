export type Point = [number, number];
export type Footprint = {
  kind: 'polygon' | 'circle';
  points?: Point[];
  center: Point;
  radius: number;
};
export const MIN_FOOTPRINT_PX = 10;
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
