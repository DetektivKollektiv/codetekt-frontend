import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getRatingLevelColor, RatingStyle } from '@/lib/utils/rating-helpers';
import { FC } from 'react';
import { ReviewersAvatarGroup } from '../archive-detail/reviewers-avatar-group';
import { HelpButton } from '../ui/help-button';

interface EvaluationProps {
  ratingStyle: RatingStyle;
  warningTags: { [K in 0 | 1 | 2 | 3]?: string }[];
  caseId: string;
  isSatire: boolean;
}

const Evaluation: FC<EvaluationProps> = ({
  ratingStyle,
  warningTags,
  caseId,
  isSatire,
}) => {
  return (
    <div className="w-full lg:w-72 flex-shrink-0 space-y-4 bg-secondary text-secondary-foreground p-4 rounded-lg h-72 lg:h-auto relative">
      <div>
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-body-sm font-semibold">Bewertung</h4>
          <HelpButton theme="dark" />
        </div>
        <Badge
          className={cn(
            ratingStyle.backgroundClass,
            ratingStyle.textForegroundClass,
            'w-full justify-center pointer-events-none h-9',
          )}
        >
          {ratingStyle.label}
        </Badge>
      </div>

      {!isSatire && warningTags.length > 0 && (
        <div>
          <h4 className="text-body-sm font-semibold mb-2">
            Tags zur Bewertung
          </h4>

          <div className="break-words min-w-0 hyphens-auto text-destructive text-body-sm line-clamp-3">
            {warningTags.slice(0, 4).map((tag, idx) => (
              <span
                style={{
                  color: getRatingLevelColor(
                    Number(Object.keys(tag)[0]) as 0 | 1 | 2 | 3,
                  ).background,
                }}
                key={JSON.stringify(tag)}
              >
                {Object.values(tag)[0]}
                {idx < warningTags.slice(0, 4).length - 1 ? ', ' : ''}
              </span>
            ))}
          </div>
        </div>
      )}
      <div>
        <h4 className="text-body-sm font-semibold mb-2">co:detectives</h4>
        <ReviewersAvatarGroup
          caseId={caseId}
          avatarSizeClassName="size-8"
          fallbackTextClassName="text-body-sm"
        />
      </div>
    </div>
  );
};

export default Evaluation;
