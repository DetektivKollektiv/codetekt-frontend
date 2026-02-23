'use client';

import { Avatar, AvatarFallback, AvatarGroup } from '@/components/ui/avatar';
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
const reviewerColors = [
  'hsl(var(--brand-coral))',
  'hsl(var(--brand-coral-dark))',
  'hsl(var(--brand-orange))',
  'hsl(var(--brand-yellow))',
];

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
      <Card className="border-none bg-brand-darkblue text-white ">
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
                  className={`px-6 py-4 rounded-lg text-body-md font-bold text-white cursor-default transition-all ${
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
              <p className="text-white/90">
                Dieser Fall wurde von{' '}
                <span className="font-semibold">
                  {reviewerCount} Detektiv*innen
                </span>{' '}
                bearbeitet. Mach mit und{' '}
                <Link href="/register" className="underline hover:text-white">
                  registriere
                </Link>{' '}
                dich jetzt!
              </p>
              {/* Reviewer avatars */}
              <AvatarGroup>
                {aggregatedReview.reviewer_ids.map((reviewerId, index) => {
                  const letter = String.fromCharCode(
                    65 + (reviewerId.charCodeAt(0) % 26),
                  );
                  return (
                    <Avatar
                      key={reviewerId}
                      className="size-12"
                      style={{
                        backgroundColor:
                          reviewerColors[index % reviewerColors.length],
                      }}
                    >
                      <AvatarFallback
                        className="text-white text-heading-sm"
                        style={{
                          backgroundColor:
                            reviewerColors[index % reviewerColors.length],
                        }}
                      >
                        {letter}
                      </AvatarFallback>
                    </Avatar>
                  );
                })}
              </AvatarGroup>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-white/90">
                Dieser Fall wurde von{' '}
                <span className="font-semibold">
                  {reviewerCount} Detektiv*innen
                </span>{' '}
                bearbeitet.
              </p>
              {/* Reviewer avatars */}
              <AvatarGroup>
                {aggregatedReview.reviewer_ids.map((reviewerId, index) => {
                  const letter = String.fromCharCode(
                    65 + (reviewerId.charCodeAt(0) % 26),
                  );
                  return (
                    <Avatar
                      key={reviewerId}
                      className="size-8"
                      style={{
                        backgroundColor:
                          reviewerColors[index % reviewerColors.length],
                      }}
                    >
                      <AvatarFallback
                        className="text-white text-body-sm"
                        style={{
                          backgroundColor:
                            reviewerColors[index % reviewerColors.length],
                        }}
                      >
                        {letter}
                      </AvatarFallback>
                    </Avatar>
                  );
                })}
              </AvatarGroup>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
