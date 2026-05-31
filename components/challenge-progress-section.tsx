import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CalendarCheck, Check, Tag, Target } from 'lucide-react';

const challengeProgress = {
  day: 12,
  totalDays: 21,
  resolvedCases: 126,
  totalTarget: 200,
  milestones: [50, 100, 150, 200],
  todaysResolvedCases: 7,
  dailyGoals: [1, 3, 5, 10],
  tagGoals: [
    {
      label: 'Landtagswahl 2026',
      resolvedCases: 24,
      target: 30,
    },
    {
      label: 'KI-Fakes',
      resolvedCases: 18,
      target: 25,
    },
    {
      label: 'Demokratie',
      resolvedCases: 12,
      target: 20,
    },
  ],
};

interface ChallengeProgressSectionProps {
  className?: string;
}

const getProgressPercent = (value: number, target: number) =>
  Math.min(Math.round((value / target) * 100), 100);

export function ChallengeProgressSection({
  className,
}: ChallengeProgressSectionProps) {
  const totalProgress = getProgressPercent(
    challengeProgress.resolvedCases,
    challengeProgress.totalTarget,
  );

  return (
    <Card
      className={cn(
        'relative w-full overflow-hidden rounded-lg border-none bg-brand-coral text-brand-darkblue shadow-md',
        className,
      )}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-brand-darkblue/25" />
      <CardHeader className="relative z-10 p-5 pb-0 sm:p-6 sm:pb-0">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-meta font-bold uppercase tracking-normal text-brand-darkblue/70">
              Community Challenge
            </p>
            <CardTitle className="mt-1 text-heading-xl font-black tracking-normal">
              Gemeinsam Richtung 200 geprüfte Fälle
            </CardTitle>
            <CardDescription className="mt-1 text-body-md text-brand-darkblue/80">
              So weit ist die Community beim Gesamtziel, bei den Tageszielen und
              bei ausgewählten Themen-Tags.
            </CardDescription>
          </div>
          <Badge variant="secondary">
            Tag {challengeProgress.day} von {challengeProgress.totalDays}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 p-5 sm:p-6">
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="flex flex-col gap-5">
            <div className="grid gap-4 md:grid-cols-[auto_minmax(0,1fr)] md:items-end">
              <div>
                <div className="flex items-center gap-2 text-body-sm font-semibold uppercase tracking-normal text-brand-darkblue/70">
                  <Target className="size-4" aria-hidden="true" />
                  Gesamtfortschritt
                </div>
                <p className="mt-2 text-5xl font-black leading-none tracking-normal tabular-nums">
                  {challengeProgress.resolvedCases}
                  <span className="text-2xl font-bold text-brand-darkblue/65">
                    /{challengeProgress.totalTarget}
                  </span>
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <div className="h-5 overflow-hidden rounded-full bg-brand-darkblue/15">
                  <div
                    className="h-full rounded-full bg-brand-darkblue"
                    style={{ width: `${totalProgress}%` }}
                  />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {challengeProgress.milestones.map((milestone) => {
                    const reached =
                      challengeProgress.resolvedCases >= milestone;

                    return (
                      <div
                        key={milestone}
                        className="flex min-w-0 flex-col gap-1 border-t border-brand-darkblue/25 pt-2"
                      >
                        <span className="text-body-sm font-bold tabular-nums">
                          {milestone}
                        </span>
                        <span className="truncate text-meta text-brand-darkblue/65">
                          {reached ? 'erreicht' : 'offen'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="border-t border-brand-darkblue/20 pt-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-body-sm font-semibold uppercase tracking-normal text-brand-darkblue/70">
                    <CalendarCheck className="size-4" aria-hidden="true" />
                    Tagesziel
                  </div>
                  <p className="mt-1 text-heading-lg font-black tracking-normal">
                    Heute {challengeProgress.todaysResolvedCases} Fälle gelöst
                  </p>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {challengeProgress.dailyGoals.map((goal) => {
                    const reached =
                      challengeProgress.todaysResolvedCases >= goal;

                    return (
                      <div
                        key={goal}
                        className="flex min-w-14 flex-col items-center gap-2"
                      >
                        <span
                          className={cn(
                            'flex size-10 items-center justify-center rounded-full border text-heading-sm font-black tabular-nums',
                            reached
                              ? 'border-brand-darkblue bg-brand-darkblue text-brand-coral'
                              : 'border-brand-darkblue/30 text-brand-darkblue/60',
                          )}
                        >
                          {reached ? (
                            <Check className="size-5" aria-hidden="true" />
                          ) : (
                            goal
                          )}
                        </span>
                        <span className="text-meta text-brand-darkblue/70">
                          {goal} Fall{goal > 1 ? 'e' : ''}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-brand-darkblue/20 pt-5 xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0">
            <div className="flex items-center gap-2 text-body-sm font-semibold uppercase tracking-normal text-brand-darkblue/70">
              <Tag className="size-4" aria-hidden="true" />
              Tag-Ziele
            </div>
            <div className="mt-4 flex flex-col gap-4">
              {challengeProgress.tagGoals.map((goal) => {
                const progress = getProgressPercent(
                  goal.resolvedCases,
                  goal.target,
                );

                return (
                  <div key={goal.label} className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-body-md font-bold leading-snug">
                        {goal.label}
                      </p>
                      <p className="shrink-0 text-body-sm font-bold tabular-nums text-brand-darkblue/75">
                        {goal.resolvedCases}/{goal.target}
                      </p>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-brand-darkblue/15">
                      <div
                        className="h-full rounded-full bg-brand-darkblue"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
