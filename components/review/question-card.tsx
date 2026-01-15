'use client';
import { ReviewTemplate } from '@/lib/queries/getReviewTemplate';
import { FC, ReactNode } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { HelpButton } from '../ui/help-button';
import { ChipField } from './fields/chip-field';
import { LikertScaleField } from './fields/likert-scale-field';
import { MultiLineTextField } from './fields/multi-line-text-field';
import { TrafficLightField } from './fields/traffic-light-field';
import { TrafficLightHeader } from './fields/traffic-light-header';

interface QuestionCardProps {
  question: NonNullable<ReviewTemplate>[number];
}

const QuestionCard: FC<QuestionCardProps> = ({ question }) => {
  // Build the fields with headers inserted where needed
  const renderFieldsWithHeaders = (): ReactNode[] => {
    const elements: ReactNode[] = [];
    let previousFieldType: string | null = null;

    question.fields.forEach((field) => {
      // Check if we need to show header before this traffic-light field
      // Show header if: this is traffic-light AND previous was not traffic-light (or is first)
      if (
        field.type === 'traffic-light' &&
        previousFieldType !== 'traffic-light'
      ) {
        elements.push(
          <TrafficLightHeader key={`header-${field.id}`} className="mb-4" />
        );
      }

      // Render the field based on its type
      if (field.type === 'multi-line-text') {
        elements.push(<MultiLineTextField key={field.id} field={field} />);
      } else if (field.type === 'chip') {
        elements.push(<ChipField key={field.id} field={field} />);
      } else if (field.type === 'traffic-light') {
        elements.push(<TrafficLightField key={field.id} field={field} />);
      } else if (field.type === 'likert-scale') {
        elements.push(<LikertScaleField key={field.id} field={field} />);
      }

      previousFieldType = field.type;
    });

    return elements;
  };

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
      <CardContent className="space-y-12 md:space-y-8 ">
        {renderFieldsWithHeaders()}
      </CardContent>
    </Card>
  );
};

export default QuestionCard;
