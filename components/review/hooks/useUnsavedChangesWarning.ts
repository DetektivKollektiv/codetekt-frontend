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
  const [isActive, setIsActive] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const lastSavedDataRef = useRef<string>(JSON.stringify(data));
  const isInitialMount = useRef(true);

  // Check if data has changed from last saved version
  useEffect(() => {
    // Skip the initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const currentDataStr = JSON.stringify(data);
    const hasChanged = lastSavedDataRef.current !== currentDataStr;

    if (hasChanged) {
      setHasUnsavedChanges(true);
    }
  }, [data]);

  // Warn user before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && isActive) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Block in-app navigation with unsaved changes
  useEffect(() => {
    if (!hasUnsavedChanges && !isActive) return;

    const handleClick = (e: MouseEvent) => {
      if (!isActive) return;
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
    setIsActive,
  };
};
