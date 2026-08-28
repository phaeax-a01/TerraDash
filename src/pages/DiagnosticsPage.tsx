import { QuizProvider } from '../QuizContext';
import { QuizPlayer } from '../QuizPlayer';
import { generatedLocations as locations } from '../contracts/generatedData';
import { playableLocations, quizOptions, worldQuiz } from '../contracts/quiz';
import { mapLayerForQuiz, mapLocationForQuizId } from '../quizMapBoundary';
import { MapView } from '../map/MapView';
import { QuizThumbnail } from '../shell/QuizThumbnail';
import { AppPageFrame } from '../shell/AppPageFrame';

export function DiagnosticsPage({
  quizId,
  locationId,
  onQuizChange,
  onLocationChange,
}: {
  quizId: string;
  locationId?: string;
  onQuizChange: (quizId: string) => void;
  onLocationChange: (locationId: string) => void;
}) {
  const selectedQuiz =
    quizOptions.find((quiz) => quiz.id === quizId) ?? worldQuiz;
  const initialLocationId = selectedQuiz.locationIds.includes(locationId ?? '')
    ? locationId
    : selectedQuiz.locationIds[0];
  return (
    <AppPageFrame selectedQuizId={selectedQuiz.id}>
      <QuizProvider
        key={selectedQuiz.id}
        quiz={selectedQuiz}
        catalog={playableLocations}
      >
        <QuizPlayer
          catalog={playableLocations}
          quizId={selectedQuiz.id}
          quizName={selectedQuiz.name}
          quizOptions={quizOptions}
          autoStart
          onAutoStartHandled={() => undefined}
          diagnostics={{
            initialLocationId,
            onQuizChange,
            onLocationChange,
            onEndQuiz: () => undefined,
          }}
          renderMap={(active) => (
            <MapView
              active={
                mapLocationForQuizId(active.id)! as (typeof locations)[number]
              }
              layer={mapLayerForQuiz(
                selectedQuiz,
                mapLocationForQuizId(active.id)! as (typeof locations)[number],
              )}
            />
          )}
          renderQuizThumbnail={(quiz) => <QuizThumbnail quiz={quiz} />}
        />
      </QuizProvider>
    </AppPageFrame>
  );
}
