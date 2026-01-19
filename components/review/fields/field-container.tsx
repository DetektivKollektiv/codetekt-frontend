import { FC, ReactNode } from 'react';

interface FieldContainerProps {
  title: string;
  is_disputable?: boolean;
  children: ReactNode;
}

export const FieldContainer: FC<FieldContainerProps> = ({
  title,
  is_disputable = false,
  children,
}) => {
  return (
    <div className="space-y-3">
      <h3 className="text-body-md font-medium">{title}</h3>
      {children}
    </div>
  );
};
