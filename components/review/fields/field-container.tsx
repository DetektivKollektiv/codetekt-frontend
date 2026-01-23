import { Button } from '@/components/ui/button';
import { FC, ReactNode } from 'react';

interface FieldContainerProps {
  title: string;
  isDisputable?: boolean;
  isDisabled?: boolean;
  children: ReactNode;
  onCreateReviewDispute: () => void;
  hasError?: boolean;
}

export const FieldContainer: FC<FieldContainerProps> = ({
  title,
  isDisputable = false,
  isDisabled = false,
  onCreateReviewDispute,
  children,
  hasError = false,
}) => {
  return (
    <div className="space-y-3 flex flex-col h-full">
      <div className="flex-1">
        <h3
          className={`text-body-md font-medium mb-2 ${isDisabled ? 'text-muted-foreground' : ''} ${hasError ? 'text-destructive' : ''}`}
        >
          {title}
        </h3>
        <div className="flex-1">{children}</div>
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
