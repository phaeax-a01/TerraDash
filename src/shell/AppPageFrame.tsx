import { type ReactNode } from 'react';
import { AppDisclaimer, AppFooter, AppHeader } from './AppChrome';

export function AppPageFrame({
  selectedQuizId,
  children,
}: {
  selectedQuizId?: string;
  children: ReactNode;
}) {
  return (
    <main className="app-shell">
      <AppHeader selectedQuizId={selectedQuizId} />
      {children}
      <AppFooter>
        <AppDisclaimer />
      </AppFooter>
    </main>
  );
}
