import { ReviewTemplate } from '@/lib/queries/getReviewTemplate';
import { Field } from '@/lib/schemas/field-schemas';
import { ReactNode } from 'react';
import { ChipField } from '../fields/chip-field';
import { LikertScaleField } from '../fields/likert-scale-field';
import { MultiLineTextField } from '../fields/multi-line-text-field';
import { TextAreaField } from '../fields/text-area-field';
import { TextField } from '../fields/text-field';
import { TrafficLightField } from '../fields/traffic-light-field';
import { TrafficLightHeader } from '../fields/traffic-light-header';

type Question = NonNullable<ReviewTemplate>[number];

interface RenderFieldsOptions {
  currentQuestion: Question;
  onFieldChange: (
    questionId: string,
    fieldId: string,
    value: Field['answer_value']
  ) => void;
}

/**
 * Build the fields with headers inserted where needed
 */
export const renderFieldsWithHeaders = ({
  currentQuestion,
  onFieldChange,
}: RenderFieldsOptions): ReactNode[] => {
  const elements: ReactNode[] = [];
  let previousFieldType: string | null = null;

  currentQuestion.fields.forEach((field) => {
    // Skip fields that are not shown
    if (field.is_shown === false) {
      return;
    }

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

    // Handler function for this field
    const handleChange = (value: Field['answer_value']) => {
      onFieldChange(currentQuestion.id, field.id, value);
    };

    // Render the field based on its type
    if (field.type === 'multi-line-text') {
      elements.push(
        <MultiLineTextField
          key={field.id}
          field={field}
          onChange={handleChange}
        />
      );
    } else if (field.type === 'chip') {
      elements.push(
        <ChipField key={field.id} field={field} onChange={handleChange} />
      );
    } else if (field.type === 'traffic-light') {
      elements.push(
        <TrafficLightField
          key={field.id}
          field={field}
          onChange={handleChange}
        />
      );
    } else if (field.type === 'likert-scale') {
      elements.push(
        <LikertScaleField
          key={field.id}
          field={field}
          onChange={handleChange}
        />
      );
    } else if (field.type === 'text-area') {
      elements.push(
        <TextAreaField key={field.id} field={field} onChange={handleChange} />
      );
    } else if (field.type === 'text') {
      elements.push(
        <TextField key={field.id} field={field} onChange={handleChange} />
      );
    }

    previousFieldType = field.type;
  });

  return elements;
};
