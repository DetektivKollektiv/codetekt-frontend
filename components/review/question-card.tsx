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
import { HelpButton } from '../ui/help-button';

interface QuestionCardProps {
  question: NonNullable<ReviewTemplate>[number];
  children: ReactNode;
  footer: ReactNode;
}

const QuestionCard: FC<QuestionCardProps> = ({
  question,
  children,
  footer,
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
        <HelpButton className="absolute top-6 right-6" />
      </CardHeader>
      <CardContent className="space-y-12 md:space-y-8 ">{children}</CardContent>
      <CardFooter className="mt-auto flex-1 flex flex-col justify-end">
        {footer}
      </CardFooter>
    </Card>
  );
};

export default QuestionCard;
