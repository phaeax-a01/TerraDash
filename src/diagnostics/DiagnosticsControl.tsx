import type { QuizOption } from '../contracts/quiz';
import { playableLocationsById } from '../contracts/playableLocation';

export function DiagnosticsControl({
  quizId,
  quizOptions,
  locationId,
  locationIds,
  onQuizChange,
  onLocationChange,
  onEndQuiz,
}: {
  quizId: string;
  quizOptions: readonly QuizOption[];
  locationId: string;
  locationIds: readonly string[];
  onQuizChange: (quizId: string) => void;
  onLocationChange: (locationId: string) => void;
  onEndQuiz: () => void;
}) {
  return (
    <div className="diagnostics-controls" aria-label="Diagnostics controls">
      <label htmlFor="diagnostic-quiz">
        <span className="visually-hidden">Quiz</span>
        <select
          id="diagnostic-quiz"
          value={quizId}
          onChange={(event) => onQuizChange(event.target.value)}
        >
          {quizOptions.map((quiz) => (
            <option key={quiz.id} value={quiz.id}>
              {quiz.name}
            </option>
          ))}
        </select>
      </label>
      <label htmlFor="diagnostic-location">
        <span className="visually-hidden">Location</span>
        <select
          id="diagnostic-location"
          value={locationId}
          onChange={(event) => onLocationChange(event.target.value)}
        >
          {locationIds.map((id) => (
            <option key={id} value={id}>
              {playableLocationsById.get(id)?.name ?? id}
            </option>
          ))}
        </select>
      </label>
      <button type="button" onClick={onEndQuiz}>
        End Quiz
      </button>
    </div>
  );
}
