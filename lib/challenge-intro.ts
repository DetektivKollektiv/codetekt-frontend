export function hasSeenChallengeIntroForVisibilityWindow({
  seenAt,
  visibleFrom,
}: {
  seenAt?: string | null;
  visibleFrom: string;
}) {
  if (!seenAt) {
    return false;
  }

  const seenAtTime = Date.parse(seenAt);
  const visibleFromTime = Date.parse(visibleFrom);

  if (Number.isNaN(seenAtTime) || Number.isNaN(visibleFromTime)) {
    return false;
  }

  return seenAtTime >= visibleFromTime;
}
