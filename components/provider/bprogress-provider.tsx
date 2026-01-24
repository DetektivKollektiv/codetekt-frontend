'use client';

import { ProgressProvider } from '@bprogress/next/app';

const BProgressProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProgressProvider
      height="1px"
      color="hsl(var(--primary))" // Nutze deine Theme-Farbe
      options={{
        showSpinner: false,
        template: null, // WICHTIG: Verhindert automatische Bar
      }}
      shallowRouting
    >
      {children}
    </ProgressProvider>
  );
};

export default BProgressProvider;
