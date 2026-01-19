'use client';
import { ReviewTemplate } from '@/lib/queries/getReviewTemplate';
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
  question: NonNullable<ReviewTemplate>[number];
  children: ReactNode;
  footer: ReactNode;
  headerActions?: ReactNode;
}

const QuestionCard: FC<QuestionCardProps> = ({
  question,
  children,
  footer,
  headerActions,
}) => {
  return (
    <Card className="pt-6 flex flex-col">
      <CardHeader className="relative">
        <CardTitle className=" text-display-sm">
          {question.metadata.title}
        </CardTitle>
        <CardDescription className="max-w-xl">
          {question.metadata.text}
        </CardDescription>
        {headerActions && (
          <div className="absolute top-6 right-6 space-x-4">
            {headerActions}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-12 md:space-y-8 flex-1">
        {children}
      </CardContent>
      <CardFooter className="mt-auto flex flex-col justify-end">
        {footer}
      </CardFooter>
    </Card>
  );
};

export default QuestionCard;
