'use client';

import { Avatar, AvatarFallback, AvatarGroup } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { aggregationReviewersQuery } from '@/lib/queries/getAggregationReviewers';
import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface ReviewersAvatarGroupProps {
  caseId: string;
  avatarSizeClassName: 'size-12' | 'size-8';
  fallbackTextClassName: 'text-heading-sm' | 'text-body-sm';
}

const reviewerColors = [
  'hsl(var(--brand-coral))',
  'hsl(var(--brand-coral-dark))',
  'hsl(var(--brand-orange))',
  'hsl(var(--brand-yellow))',
];

export function ReviewersAvatarGroup({
  caseId,
  avatarSizeClassName,
  fallbackTextClassName,
}: ReviewersAvatarGroupProps) {
  const supabase = createClient();

  const { data: reviewers } = useQuery(
    aggregationReviewersQuery(supabase, [caseId]),
  );

  if (!reviewers || reviewers.length === 0) {
    return null;
  }

  const hasFewReviewsWarning = reviewers.length < 5;

  return (
    <AvatarGroup>
      {reviewers.map((reviewer, index) => {
        const letter = (reviewer.username?.charAt(0) || '').toUpperCase();

        return (
          <Tooltip key={reviewer.reviewer_id}>
            <TooltipTrigger asChild>
              <Avatar
                className={avatarSizeClassName}
                style={{
                  backgroundColor:
                    reviewerColors[index % reviewerColors.length],
                }}
              >
                <AvatarFallback
                  className={`text-neutral-0 ${fallbackTextClassName}`}
                  style={{
                    backgroundColor:
                      reviewerColors[index % reviewerColors.length],
                  }}
                >
                  {letter}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            {reviewer.username ? (
              <TooltipContent
                className="bg-neutral-100 text-neutral-800 border border-neutral-300 shadow-sm"
                arrowClassName="bg-neutral-100 fill-neutral-100"
              >
                <p>{reviewer.username}</p>
              </TooltipContent>
            ) : null}
          </Tooltip>
        );
      })}
      {hasFewReviewsWarning ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Avatar
              className={avatarSizeClassName}
              style={{
                backgroundColor: 'hsl(var(--destructive))',
              }}
            >
              <AvatarFallback
                className={`text-destructive-foreground ${fallbackTextClassName}`}
                style={{
                  backgroundColor: 'hsl(var(--destructive))',
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-circle-alert-icon lucide-circle-alert"
                >
                  <line x1="12" x2="12" y1="8" y2="12" />
                  <line x1="12" x2="12.01" y1="16" y2="16" />
                </svg>
              </AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent
            className="bg-neutral-100 text-neutral-800 border border-neutral-300 shadow-sm"
            arrowClassName="bg-neutral-100 fill-neutral-100"
          >
            <p className="text-center">
              Es haben weniger als <br /> 5 Reviewer den Fall bewertet.
            </p>
          </TooltipContent>
        </Tooltip>
      ) : null}
    </AvatarGroup>
  );
}
