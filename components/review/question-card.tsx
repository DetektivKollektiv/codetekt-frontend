'use client';
import { FC, ReactNode } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';

interface QuestionCardProps {
  title: ReactNode;
  description: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  headerActions?: ReactNode;
  contentClassName?: string;
}

const QuestionCard: FC<QuestionCardProps> = ({
  title,
  description,
  children,
  footer,
  headerActions,
  contentClassName,
}) => {
  return (
    <Card className="pt-6 flex flex-col">
      <CardHeader className="relative">
        <CardTitle className=" text-display-sm">{title}</CardTitle>
        <CardDescription className="max-w-xl">{description}</CardDescription>
        {headerActions && (
          <div className="absolute top-6 right-6 space-x-4">
            {headerActions}
          </div>
        )}
      </CardHeader>
      <CardContent
        className={contentClassName ?? 'space-y-12 md:space-y-8 flex-1'}
      >
        {children}
      </CardContent>
      {footer && (
        <CardFooter className="mt-auto flex flex-col justify-end">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
};

export default QuestionCard;
