'use client';

import { ReviewersAvatarGroup } from '@/components/archive-detail/reviewers-avatar-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpButton } from '@/components/ui/help-button';
import type { AggregatedReview } from '@/lib/queries/getAggregatedReview';
import { createClient } from '@/lib/supabase/client';
import { getAuth } from '@/lib/supabase/getAuth';
import { getRatingStyle } from '@/lib/utils/rating-helpers';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

interface DetailRatingProps {
  aggregatedReview: NonNullable<AggregatedReview>;
  auth: Awaited<ReturnType<typeof getAuth>>;
}

// Define rating levels and reviewer avatars
const ratingLevels = [0, 1, 2, 3] as const;

export function DetailRating({ aggregatedReview, auth }: DetailRatingProps) {
  const supabase = createClient();

  const { data: authData } = useQuery({
    queryFn: () => getAuth(supabase),
    queryKey: ['auth'],
    initialData: auth,
  });

  const { isAuthenticated } = authData;
  const score = Number(aggregatedReview.result_score);
  const currentRating = getRatingStyle(score);
  const reviewerCount = aggregatedReview.reviewer_ids.length;

  return (
    <div className="page-max-w">
      <Card className="border-none bg-brand-darkblue text-neutral-0 ">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
          <CardTitle className="text-heading-xl">Bewertung des Falls</CardTitle>
          <HelpButton theme="dark" href="/help" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Rating buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {ratingLevels.map((level) => {
              const rating = getRatingStyle(level);
              const isActive = rating.label === currentRating.label;
              return (
                <button
                  key={level}
                  disabled
                  className={`px-6 py-4 rounded-lg text-body-md font-bold text-neutral-0 cursor-default transition-all ${
                    isActive ? 'opacity-100' : 'bg-white/20 opacity-70'
                  }`}
                  style={
                    isActive
                      ? {
                          backgroundColor: rating.backgroundColor,
                          color: rating.foregroundColor,
                        }
                      : undefined
                  }
                >
                  {rating.label}
                </button>
              );
            })}
          </div>
          {/* Reviewer info and CTA */}
          {!isAuthenticated ? (
            <div className="space-y-4">
              <p className="text-neutral-0/90">
                Dieser Fall wurde von{' '}
                <span className="font-semibold">
                  {reviewerCount} Detektiv*innen
                </span>{' '}
                bearbeitet. Mach mit und{' '}
                <Link
                  href="/register"
                  className="underline hover:text-neutral-0"
                >
                  registriere
                </Link>{' '}
                dich jetzt!
              </p>
              {/* Reviewer avatars */}
              <ReviewersAvatarGroup
                caseId={aggregatedReview.case_id}
                avatarSizeClassName="size-12"
                fallbackTextClassName="text-heading-sm"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-neutral-0/90">
                Dieser Fall wurde von{' '}
                <span className="font-semibold">
                  {reviewerCount} Detektiv*innen
                </span>{' '}
                bearbeitet.
              </p>
              {/* Reviewer avatars */}
              <ReviewersAvatarGroup
                caseId={aggregatedReview.case_id}
                avatarSizeClassName="size-8"
                fallbackTextClassName="text-body-sm"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
