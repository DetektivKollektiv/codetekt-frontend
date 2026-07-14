import type { ChallengeMessageData } from './schemas';

const DATE_PREFIX_PATTERN = /^(\d{4})-(\d{2})-(\d{2})/;

const toTimestamp = (value: string) => {
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
};

const toDateLabel = (value: string) => {
  const datePrefix = DATE_PREFIX_PATTERN.exec(value);

  if (datePrefix) {
    const [, year, month, day] = datePrefix;
    return `${day}.${month}.${year}`;
  }

  const timestamp = toTimestamp(value);

  if (timestamp === null) {
    return null;
  }

  const [year, month, day] = new Date(timestamp)
    .toISOString()
    .slice(0, 10)
    .split('-');

  return `${day}.${month}.${year}`;
};

export function getVisibleChallengeMessage(
  messages: ChallengeMessageData[],
  now = new Date(),
) {
  const nowTimestamp = now.getTime();

  if (Number.isNaN(nowTimestamp)) {
    return null;
  }

  return messages.reduce<ChallengeMessageData | null>((latest, message) => {
    const visibleFrom = toTimestamp(message.visibleFrom);
    const visibleUntil = toTimestamp(message.visibleUntil);

    if (
      visibleFrom === null ||
      visibleUntil === null ||
      visibleFrom > nowTimestamp ||
      visibleUntil < nowTimestamp
    ) {
      return latest;
    }

    if (!latest) {
      return message;
    }

    const latestVisibleFrom =
      toTimestamp(latest.visibleFrom) ?? Number.NEGATIVE_INFINITY;
    const latestVisibleUntil =
      toTimestamp(latest.visibleUntil) ?? Number.NEGATIVE_INFINITY;

    if (
      visibleFrom > latestVisibleFrom ||
      (visibleFrom === latestVisibleFrom && visibleUntil > latestVisibleUntil)
    ) {
      return message;
    }

    return latest;
  }, null);
}

export function formatChallengeMessageDateRange(
  message: ChallengeMessageData,
) {
  const formattedFrom = toDateLabel(message.visibleFrom);
  const formattedUntil = toDateLabel(message.visibleUntil);

  if (!formattedFrom || !formattedUntil) {
    return '';
  }

  return formattedFrom === formattedUntil
    ? formattedFrom
    : `${formattedFrom} - ${formattedUntil}`;
}
