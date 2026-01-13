import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { RatingStyle } from '@/lib/utils/rating-helpers';
import { FC } from 'react';

interface EvaluationProps {
  ratingStyle: RatingStyle;
  warningTags: string[];
}

const Evaluation: FC<EvaluationProps> = ({ ratingStyle, warningTags }) => {
  return (
    <div className="w-full lg:w-72 flex-shrink-0 space-y-4 bg-secondary text-secondary-foreground p-4 rounded-lg h-48 lg:h-auto relative">
      <div>
        <h4 className="text-sm font-semibold mb-2">Bewertung</h4>
        <Badge
          className={cn(
            ratingStyle.colorClass,
            'w-full justify-center pointer-events-none'
          )}
        >
          {ratingStyle.label}
        </Badge>
      </div>

      {warningTags.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-2">Tags zur Bewertung</h4>
          <div className="break-words min-w-0 hyphens-auto text-destructive text-body-sm">
            {warningTags.slice(0, 4).map((tag, idx) => (
              <span className="" key={tag}>
                {tag}
                {idx < warningTags.slice(0, 4).length - 1 ? ', ' : ''}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Evaluation;
