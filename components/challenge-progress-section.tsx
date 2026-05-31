import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

const challengeProgress = {
  title: 'Landtagswahlen 2026',
  day: 12,
  totalDays: 25,
  resolvedCases: 126,
  totalTarget: 200,
  milestones: [0, 50, 100, 150, 200],
  dailyGoals: [1, 3, 5, 10],
  dailyResolvedCases: [
    3, 4, 6, 11, 7, 4, 3, 0, 2, 4, 5, 10, 8, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
  tagGoals: [
    {
      label: 'Landtagswahl 2026',
      resolvedCases: 13,
      target: 12,
    },
    {
      label: 'KI-Fakes',
      resolvedCases: 11,
      target: 12,
    },
    {
      label: 'Demokratie',
      resolvedCases: 7,
      target: 12,
    },
  ],
};

interface ChallengeProgressSectionProps {
  className?: string;
}

type DailyGoalStatus = 'open' | 'one' | 'three' | 'five' | 'ten';

const dailyGoalStatusStyles: Record<DailyGoalStatus, string> = {
  open: 'border-neutral-500/70 bg-neutral-0/15 text-neutral-800/50',
  one: 'border-brand-red bg-neutral-0/15 text-brand-red',
  three: 'border-brand-orange bg-neutral-0/15 text-brand-orange',
  five: 'border-brand-green bg-neutral-0/15 text-brand-green',
  ten: 'border-brand-darkblue bg-brand-green/20 text-brand-darkblue',
};

const dailyGoalLegend: { label: string; status: DailyGoalStatus }[] = [
  { label: '1+ Fall', status: 'one' },
  { label: '3+ Fälle', status: 'three' },
  { label: '5+ Fälle', status: 'five' },
  { label: '10+ Fälle', status: 'ten' },
];

const milestoneSegments = challengeProgress.milestones
  .slice(1)
  .map((milestone, index) => ({
    start: challengeProgress.milestones[index],
    end: milestone,
  }));

const dailyProgress = challengeProgress.dailyResolvedCases.map(
  (resolvedCases, index) => ({
    day: index + 1,
    date: `${String(index + 1).padStart(2, '0')}.09.`,
    resolvedCases,
  }),
);

const getProgressPercent = (value: number, target: number) =>
  Math.min(Math.round((value / target) * 100), 100);

const getSegmentProgressPercent = (value: number, start: number, end: number) =>
  getProgressPercent(Math.max(value - start, 0), end - start);

const getDailyGoalStatus = (resolvedCases: number): DailyGoalStatus => {
  if (resolvedCases >= challengeProgress.dailyGoals[3]) return 'ten';
  if (resolvedCases >= challengeProgress.dailyGoals[2]) return 'five';
  if (resolvedCases >= challengeProgress.dailyGoals[1]) return 'three';
  if (resolvedCases >= challengeProgress.dailyGoals[0]) return 'one';
  return 'open';
};

export function ChallengeProgressSection({
  className,
}: ChallengeProgressSectionProps) {
  return (
    <Card
      className={cn(
        'relative w-full overflow-hidden rounded-lg border-2 border-brand-darkblue/35 bg-brand-coral text-brand-darkblue shadow-md',
        className,
      )}
    >
      <CardHeader className="p-5 pb-0 sm:p-6 sm:pb-0 lg:p-10 lg:pb-0">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <div>
            <p className="text-meta font-bold uppercase tracking-normal text-brand-darkblue/65">
              Community Challenge •{' '}
              <span className="text-brand-darkblue/85">
                Tag {challengeProgress.day} von {challengeProgress.totalDays}
              </span>
            </p>
            <CardTitle className="mt-2 text-display-sm uppercase tracking-normal sm:text-display-md">
              {challengeProgress.title}
            </CardTitle>
          </div>
          <div className="lg:text-right">
            <p className="text-meta font-bold uppercase tracking-normal text-brand-darkblue/65">
              Gesamtfortschritt
            </p>
            <p className="mt-2 text-display-sm font-black leading-none tracking-normal tabular-nums sm:text-display-md">
              {challengeProgress.resolvedCases}
              <span className="text-brand-darkblue/45">
                /{challengeProgress.totalTarget}
              </span>
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 lg:p-10">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-body-sm font-black tabular-nums">0</span>
          {milestoneSegments.map((segment) => (
            <div
              key={segment.end}
              className="contents"
              aria-label={`${segment.start} bis ${segment.end} Fälle`}
            >
              <div className="h-3 min-w-0 flex-1 overflow-hidden rounded-full bg-brand-darkblue/25">
                <div
                  className="h-full rounded-full bg-brand-darkblue"
                  style={{
                    width: `${getSegmentProgressPercent(
                      challengeProgress.resolvedCases,
                      segment.start,
                      segment.end,
                    )}%`,
                  }}
                />
              </div>
              <span className="text-body-sm font-black tabular-nums">
                {segment.end}
              </span>
            </div>
          ))}
        </div>

        <CardDescription className="mt-8 grid gap-5 text-body-md font-semibold text-brand-darkblue/85 md:grid-cols-2 lg:mt-10">
          <p>
            codetekt e. V. ist eine gemeinnützige Organisation mit dem Ziel,
            Strategien zum Erkennen und Eindämmen von Desinformation zu
            entwickeln.
          </p>
          <p>
            Gemeinsam fördern wir Medien- und Nachrichtenkompetenz und machen
            sichtbar, wie weit die Community in der Challenge schon gekommen
            ist.
          </p>
        </CardDescription>

        <div className="my-8 h-px bg-brand-darkblue/25 lg:my-10" />

        <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr] xl:gap-10">
          <section>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-heading-lg font-black tracking-normal">
                Tagesziele
              </h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:flex sm:flex-wrap sm:justify-end">
                {dailyGoalLegend.map((item) => (
                  <div key={item.status} className="flex items-center gap-2">
                    <span
                      className={cn(
                        'size-4 rounded-full border-4',
                        dailyGoalStatusStyles[item.status],
                      )}
                      aria-hidden="true"
                    />
                    <span className="text-meta font-bold text-brand-darkblue/65">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-5 gap-x-3 gap-y-5 sm:grid-cols-8 lg:gap-x-4">
              {dailyProgress.map((day) => {
                const status = getDailyGoalStatus(day.resolvedCases);

                return (
                  <div
                    key={day.day}
                    className="flex min-w-0 flex-col items-center gap-2"
                  >
                    <span
                      className={cn(
                        'flex size-10 items-center justify-center rounded-full border-4 text-meta font-bold tabular-nums sm:size-11',
                        dailyGoalStatusStyles[status],
                        day.day === challengeProgress.day &&
                          'ring-2 ring-brand-darkblue/45 ring-offset-2 ring-offset-brand-coral',
                      )}
                      aria-label={`Tag ${day.day}: ${day.resolvedCases} gelöste Fälle`}
                    >
                      <span className="sr-only">
                        {day.resolvedCases} gelöste Fälle
                      </span>
                    </span>
                    <span className="text-meta font-bold tabular-nums text-brand-darkblue/60">
                      {day.date}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="border-t border-brand-darkblue/25 pt-8 xl:border-l xl:border-t-0 xl:pl-10 xl:pt-0">
            <h3 className="text-heading-lg font-black tracking-normal">
              Tag-Ziele
            </h3>
            <div className="mt-6 flex flex-col gap-6">
              {challengeProgress.tagGoals.map((goal) => {
                const progress = getProgressPercent(
                  goal.resolvedCases,
                  goal.target,
                );

                return (
                  <div key={goal.label} className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-heading-sm font-black text-brand-darkblue/65">
                        {goal.label}
                      </p>
                      <p className="shrink-0 text-heading-sm font-black tabular-nums">
                        {goal.resolvedCases}/{goal.target}
                      </p>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-brand-darkblue/25">
                      <div
                        className="h-full rounded-full bg-brand-darkblue"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </CardContent>
    </Card>
  );
}
