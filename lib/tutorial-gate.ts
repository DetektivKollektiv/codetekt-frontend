export const TUTORIAL_PATH = '/tutorial';

export function isTutorialPath(pathname: string) {
  return pathname === TUTORIAL_PATH || pathname.startsWith(`${TUTORIAL_PATH}/`);
}

export function shouldRedirectToTutorial({
  pathname,
  tutorialCompletedAt,
  userId,
}: {
  pathname: string;
  tutorialCompletedAt?: string | null;
  userId?: string | null;
}) {
  return Boolean(
    userId && tutorialCompletedAt === null && !isTutorialPath(pathname),
  );
}
