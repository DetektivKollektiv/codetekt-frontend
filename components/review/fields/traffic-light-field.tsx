'use client';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { trafficLightAnswerSchema } from '@/lib/schemas';
import { trafficLightFieldSchema } from '@/lib/schemas/field-schemas';
import { FC, useMemo } from 'react';
import { z } from 'zod';
import { $ZodIssue } from 'zod/v4/core';

type TrafficLightField = z.infer<typeof trafficLightFieldSchema>;

// Traffic light values: 0 = green, 1 = yellow/orange, 2 = orange, 3 = red, 4 = no answer
type TrafficLightValue = z.infer<typeof trafficLightAnswerSchema>;

interface TrafficLightFieldProps {
  field: TrafficLightField;
  onChange?: (value: TrafficLightValue) => void;
  issues: $ZodIssue[];
}

export const TrafficLightField: FC<TrafficLightFieldProps> = ({
  field,
  onChange,
  issues,
}) => {
  const value = (field.answer_value ?? null) as TrafficLightValue;
  const isDisabled =
    field.is_disabled === undefined ? false : (field.is_disabled as boolean);

  const handleChange = (newValue: string) => {
    if (isDisabled) return;
    const numValue = parseInt(newValue, 10) as TrafficLightValue;
    onChange?.(numValue);
  };

  const issue = useMemo(() => {
    return issues.length > 0 ? issues[0] : null;
  }, [issues]);

  // Get the question text from the first option
  const questionText = field.question || '';

  return (
    <div className="md:min-h-9 border-b pb-6 last:border-0 last:pb-0">
      <div className="flex flex-col-reverse md:flex-row md:items-start justify-between gap-4 md:gap-12 ">
        <div className="flex-1 ">
          <p
            className={`text-body-md md:text-body-sm font-bold cursor-pointer leading-normal ${isDisabled ? 'text-muted-foreground' : ''} ${issue ? 'text-destructive' : ''}`}
            style={{
              fontWeight: 500,
            }}
          >
            {questionText}
          </p>
          <p
            className={`block mt-1 font-normal text-body-md md:text-body-sm italic cursor-pointer leading-normal ${isDisabled ? 'text-muted-foreground ' : ''}`}
          >
            {field.shortTip}
          </p>
        </div>
        <RadioGroup
          value={value?.toString() ?? ''}
          onValueChange={handleChange}
          disabled={isDisabled}
          className="flex justify-between md:justify-start w-full md:w-auto md:items-center gap-2 mt-1 min-w-32"
        >
          {field.options.map((option) => {
            return (
              <RadioGroupItem
                value={option.value.toString()}
                className="size-6 md:size-5 border-2"
                style={{
                  borderColor: option.color,
                }}
                key={option.value}
                iconClassName="size-3 stroke-0"
                iconStyle={{
                  fill: option.color,
                }}
              />
            );
          })}
        </RadioGroup>
      </div>
    </div>
  );
};
