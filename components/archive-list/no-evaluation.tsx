import { TrustLevel } from '@/lib/utils/trust-level';
import { FC } from 'react';

interface NoEvaluationProps {
  trustLevel: TrustLevel;
  warningTags: string[];
}

const NoEvaluation: FC<NoEvaluationProps> = ({ trustLevel, warningTags }) => {
  return (
    <div className="w-full lg:w-72 flex-shrink-0 space-y-4 bg-secondary text-secondary-foreground p-4 rounded-lg h-48 lg:h-auto relative">
      <div className="absolute inset-0 bg-neutral rounded-lg w-full h-full z-10"></div>
    </div>
  );
};

export default NoEvaluation;
