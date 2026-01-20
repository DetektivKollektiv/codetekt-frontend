import { FC, ReactNode } from 'react';

interface FieldContainerProps {
  title: string;
  isDisputable?: boolean;
  isDisabled?: boolean;
  children: ReactNode;
}

export const FieldContainer: FC<FieldContainerProps> = ({
  title,
  isDisputable = false,
  isDisabled = false,
  children,
}) => {
  return (
    <div className="space-y-3">
      <h3
        className={`text-body-md font-medium ${isDisabled ? 'text-muted-foreground' : ''}`}
      >
        {title}
      </h3>
      {children}
    </div>
  );
};
