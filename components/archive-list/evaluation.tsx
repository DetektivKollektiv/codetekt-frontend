import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TrustLevel } from '@/lib/utils/trust-level';
import { FC } from 'react';

interface EvaluationProps {
  trustLevel: TrustLevel;
  warningTags: string[];
}

const Evaluation: FC<EvaluationProps> = ({ trustLevel, warningTags }) => {
  return (
    <div className="w-full lg:w-72 flex-shrink-0 space-y-4 bg-secondary text-secondary-foreground p-4 rounded-lg h-48 lg:h-auto relative">
      <div>
        <h4 className="text-sm font-semibold mb-2">Bewertung</h4>
        <Badge
          className={cn(
            trustLevel.colorClass,
            'w-full justify-center pointer-events-none'
          )}
        >
          {trustLevel.label}
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
