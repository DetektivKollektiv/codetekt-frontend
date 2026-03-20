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
                  backgroundColor: reviewerColors[index % reviewerColors.length],
                }}
              >
                <AvatarFallback
                  className={`text-neutral-0 ${fallbackTextClassName}`}
                  style={{
                    backgroundColor: reviewerColors[index % reviewerColors.length],
                  }}
                >
                  {letter}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            {reviewer.username ? (
              <TooltipContent>
                <p>{reviewer.username}</p>
              </TooltipContent>
            ) : null}
          </Tooltip>
        );
      })}
    </AvatarGroup>
  );
}
