'use client';
import { ReviewTemplate } from '@/lib/queries/getReviewTemplate';
import { FC } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { HelpButton } from '../ui/help-button';
import { MultiLineTextField } from './fields/multi-line-text-field';

interface QuestionCardProps {
  question: NonNullable<ReviewTemplate>[number];
}

const QuestionCard: FC<QuestionCardProps> = ({ question }) => {
  return (
    <Card className="py-6">
      <CardHeader className="relative">
        <CardTitle className=" text-display-sm">
          {question.metadata.title}
        </CardTitle>
        <CardDescription className="max-w-xl">
          {question.metadata.text}
        </CardDescription>
        <HelpButton className="absolute top-6 right-6" />
      </CardHeader>
      <CardContent className="space-y-6">
        {question.fields.map((field) => {
          if (field.type === 'multi-line-text') {
            return <MultiLineTextField key={field.id} field={field} />;
          }
          return null;
        })}
      </CardContent>
    </Card>
  );
};

export default QuestionCard;
