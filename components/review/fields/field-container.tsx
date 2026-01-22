import { Button } from '@/components/ui/button';
import { FC, ReactNode } from 'react';

interface FieldContainerProps {
  title: string;
  isDisputable?: boolean;
  isDisabled?: boolean;
  children: ReactNode;
  onCreateReviewDispute: () => void;
}

export const FieldContainer: FC<FieldContainerProps> = ({
  title,
  isDisputable = false,
  isDisabled = false,
  onCreateReviewDispute,
  children,
}) => {
  return (
    <div className="space-y-3 flex flex-col h-full">
      <div className="flex-1">
        <h3
          className={`text-body-md font-medium mb-2 ${isDisabled ? 'text-muted-foreground' : ''}`}
        >
          {title}
        </h3>
        {children}
      </div>
      {isDisputable && (
        <Button
          variant={'destructive'}
          className="w-full translate-y-4"
          onClick={onCreateReviewDispute}
        >
          Korrektur beantragen
        </Button>
      )}
    </div>
  );
};
