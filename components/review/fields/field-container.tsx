import { FC, ReactNode } from 'react';

interface FieldContainerProps {
  title: string;
  isDisputable?: boolean;
  children: ReactNode;
}

export const FieldContainer: FC<FieldContainerProps> = ({
  title,
  isDisputable = false,
  children,
}) => {
  return (
    <div className="space-y-3">
      <h3 className="text-body-md font-medium">{title}</h3>
      {children}
    </div>
  );
};
