'use client';
import { ReviewTemplate } from '@/lib/queries/getReviewTemplate';
import { SaveAll } from 'lucide-react';
import { FC, ReactNode } from 'react';
import { Button } from '../ui/button';
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
  onSave?: () => void;
}

const QuestionCard: FC<QuestionCardProps> = ({
  question,
  children,
  footer,
  onSave,
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
        <div className="absolute top-6 right-6 space-x-4">
          <HelpButton />
          <Button variant="outline" size={'default'} onClick={onSave}>
            <SaveAll className="w-4 h-4 mr-2" />
            Speichern
          </Button>
        </div>
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
