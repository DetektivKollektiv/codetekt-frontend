'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { AggregatedReview } from '@/lib/queries/getAggregatedReview';
import { getRatingInfo, ratingInfo, type RatingKey } from '@/lib/utils/rating-helpers';
import { HelpCircle } from 'lucide-react';
import Link from 'next/link';

interface DetailRatingProps {
  aggregatedReview: NonNullable<AggregatedReview>;
  isAuthenticated: boolean;
}

// Define rating order and reviewer avatars
const ratingOrder: RatingKey[] = ['untrusted', 'mostly-untrusted', 'mostly-trusted', 'trusted'];
const reviewerColors = [
  'hsl(var(--brand-coral))',
  'hsl(var(--brand-coral-dark))',
  'hsl(var(--brand-orange))',
  'hsl(var(--brand-yellow))',
];

export function DetailRating({
  aggregatedReview,
  isAuthenticated,
}: DetailRatingProps) {
  const score = Number(aggregatedReview.result_score);
  const currentRating = getRatingInfo(score);
  const reviewerCount = aggregatedReview.reviewer_ids.length;

  return (
    <Card
      className="border-none"
      style={{
        backgroundColor: 'hsl(var(--brand-darkblue))',
        color: 'white',
      }}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <CardTitle className="text-heading-xl">Bewertung des Falls</CardTitle>
        <Link href="/help">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            Hilfe
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rating buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {ratingOrder.map((key) => {
            const rating = ratingInfo[key];
            const isActive = currentRating.key === key;

            return (
              <button
                key={key}
                disabled
                className="px-6 py-4 rounded-lg text-body-md transition-all"
                style={{
                  backgroundColor: isActive ? rating.gradientFrom : 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  cursor: 'default',
                  opacity: isActive ? 1 : 0.7,
                }}
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
              Dieser Fall wurde von <span className="font-semibold">{reviewerCount} Detektiv*innen</span> bearbeitet. Mach mit und{' '}
              <Link href="/register" className="underline hover:text-white">
                registriere
              </Link>{' '}
              dich jetzt!
            </p>

            {/* Reviewer avatars */}
            <div className="flex gap-2">
              {reviewerColors.slice(0, reviewerCount).map((color, index) => (
                <div
                  key={index}
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white text-heading-sm"
                  style={{ backgroundColor: color }}
                >
                  {String.fromCharCode(65 + index)}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-white/90">
              Dieser Fall wurde von <span className="font-semibold">{reviewerCount} Detektiv*innen</span> bearbeitet.
            </p>

            {/* Reviewer avatars */}
            <div className="flex gap-2">
              {reviewerColors.slice(0, reviewerCount).map((color, index) => (
                <div
                  key={index}
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white text-heading-sm"
                  style={{ backgroundColor: color }}
                >
                  {String.fromCharCode(65 + index)}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
