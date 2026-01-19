import { useEffect, useRef, useState } from 'react';

interface UseUnsavedChangesWarningOptions {
  /**
   * The data to track for changes
   */
  data: unknown;
  /**
   * Custom confirmation message for in-app navigation
   */
  message?: string;
}

export const useUnsavedChangesWarning = ({
  data,
  message = 'Du hast ungespeicherte Änderungen. Möchtest du die Seite wirklich verlassen?',
}: UseUnsavedChangesWarningOptions) => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const lastSavedDataRef = useRef<string | null>(null);

  // Check if data has changed from last saved version
  useEffect(() => {
    const currentDataStr = JSON.stringify(data);
    if (
      lastSavedDataRef.current !== null &&
      lastSavedDataRef.current !== currentDataStr
    ) {
      setHasUnsavedChanges(true);
    }
  }, [data]);

  // Warn user before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Block in-app navigation with unsaved changes
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');

      if (link && link.href) {
        // Check if it's an internal navigation (not external link or hash)
        const isInternal = link.href.startsWith(window.location.origin);
        const isSamePage =
          link.href.split('#')[0] === window.location.href.split('#')[0];
        const isHashOnly = link.getAttribute('href')?.startsWith('#');

        if (isInternal && !isSamePage && !isHashOnly) {
          const confirmed = window.confirm(message);

          if (!confirmed) {
            e.preventDefault();
            e.stopPropagation();
          }
        }
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [hasUnsavedChanges, message]);

  /**
   * Mark current data as saved
   */
  const markAsSaved = () => {
    setHasUnsavedChanges(false);
    lastSavedDataRef.current = JSON.stringify(data);
  };

  return {
    hasUnsavedChanges,
    markAsSaved,
  };
};
