import { useEffect } from 'react';

interface UseUnsavedChangesWarningOptions {
  hasUnsavedChanges: boolean;
  isActive?: boolean;
  message?: string;
}

export const useUnsavedChangesWarning = ({
  hasUnsavedChanges,
  isActive = true,
  message = 'Du hast ungespeicherte Änderungen. Möchtest du die Seite wirklich verlassen?',
}: UseUnsavedChangesWarningOptions) => {
  const isPromptEnabled = hasUnsavedChanges && isActive;

  // Warn user before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isPromptEnabled) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isPromptEnabled]);

  // Block in-app navigation with unsaved changes
  useEffect(() => {
    if (!isPromptEnabled) return;

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
  }, [isPromptEnabled, message]);
};
