import { mapLocationForQuizId } from '../quizMapBoundary';
import type { RenderLocation } from '../quizMapBoundary';
import { DiagnosticsPanel } from '../diagnostics/DiagnosticsPanel';
import { AppPageFrame } from '../shell/AppPageFrame';

export function DiagnosticsPage({
  locationId,
  onLocationChange,
}: {
  locationId: string;
  onLocationChange: (locationId: string) => void;
}) {
  const location = mapLocationForQuizId(locationId)! as RenderLocation;
  return (
    <AppPageFrame>
      <DiagnosticsPanel
        locationId={locationId}
        location={location}
        onLocationChange={onLocationChange}
      />
    </AppPageFrame>
  );
}
