import { Button } from '@/components/ui/button';
import { FC, ReactNode } from 'react';

interface FieldContainerProps {
  title: string;
  isDisputable?: boolean;
  isDisabled?: boolean;
  children: ReactNode;
  onCreateReviewDispute: () => void;
  hasError?: boolean;
  onSave?: () => void;
  isSaveDisabled?: boolean;
  saveLabel?: string;
}

export const FieldContainer: FC<FieldContainerProps> = ({
  title,
  isDisputable = false,
  isDisabled = false,
  onCreateReviewDispute,
  children,
  hasError = false,
  onSave,
  isSaveDisabled = false,
  saveLabel = 'Bestätigen',
}) => {
  return (
    <div className="space-y-3 flex flex-col h-full">
      <div className="flex-1">
        {title && (
          <h3
            className={`text-body-md font-medium mb-2 ${isDisabled ? 'text-muted-foreground' : ''} ${hasError ? 'text-destructive' : ''}`}
          >
            {title}
          </h3>
        )}
        <div className="flex-1">{children}</div>
      </div>
      {(onSave || isDisputable) && (
        <div className="space-y-2 translate-y-4">
          {onSave && (
            <Button
              className="w-full"
              onClick={onSave}
              disabled={isSaveDisabled}
            >
              {saveLabel}
            </Button>
          )}
          {isDisputable && (
            <Button
              variant={'destructive-secondary'}
              className="w-full"
              onClick={onCreateReviewDispute}
            >
              Korrektur beantragen
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
