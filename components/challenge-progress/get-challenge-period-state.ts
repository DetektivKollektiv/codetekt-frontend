import {
  differenceInCalendarDays,
  parseISO,
  startOfDay,
} from 'date-fns';

export function getChallengePeriodState(
  startsOn: string,
  endsOn: string,
  today = new Date(),
) {
  const startDate = parseISO(startsOn);
  const endDate = parseISO(endsOn);
  const daysSinceStart = differenceInCalendarDays(
    startOfDay(today),
    startDate,
  );
  const totalDays = Math.max(
    differenceInCalendarDays(endDate, startDate) + 1,
    0,
  );
  const isDuringChallenge =
    daysSinceStart >= 0 && daysSinceStart < totalDays;
  const currentDay = isDuringChallenge ? daysSinceStart + 1 : null;

  return {
    completedDayLimit:
      currentDay === null
        ? daysSinceStart < 0
          ? 0
          : totalDays
        : currentDay - 1,
    currentDay,
    displayedDay:
      currentDay ?? (daysSinceStart < 0 ? 0 : Math.max(totalDays, 0)),
    endDate,
    startDate,
    totalDays,
  };
}
