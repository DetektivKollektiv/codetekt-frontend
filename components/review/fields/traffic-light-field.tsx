'use client';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { trafficLightFieldSchema } from '@/lib/schemas/field-schemas';
import { FC, useState } from 'react';
import { z } from 'zod';

type TrafficLightField = z.infer<typeof trafficLightFieldSchema>;

// Traffic light values: 1 = green, 2 = yellow/orange, 3 = orange, 4 = red, 0 = no answer
type TrafficLightValue = 0 | 1 | 2 | 3 | null;

interface TrafficLightFieldProps {
  field: TrafficLightField;
  onChange?: (value: TrafficLightValue) => void;
}

export const TrafficLightField: FC<TrafficLightFieldProps> = ({
  field,
  onChange,
}) => {
  const [value, setValue] = useState<TrafficLightValue>(
    field.answer_value ?? null
  );

  const handleChange = (newValue: string) => {
    const numValue = parseInt(newValue, 10) as TrafficLightValue;
    setValue(numValue);
    onChange?.(numValue);
  };

  // Get the question text from the first option
  const questionText = field.options[0]?.question ?? '';

  return (
    <div className="flex flex-col-reverse md:flex-row md:items-center justify-between gap-4 md:gap-12 md:min-h-9 border-b pb-6 last:border-0 last:pb-0">
      <Label className="flex-1 text-body-md md:text-body-sm font-medium cursor-pointer leading-normal">
        {questionText}
      </Label>
      <RadioGroup
        value={value?.toString() ?? ''}
        onValueChange={handleChange}
        className="flex justify-between md:justify-end w-full md:w-auto md:items-center gap-2"
      >
        {/* Green - value 1 */}
        <RadioGroupItem
          value="1"
          className="size-6 md:size-5 border-2 border-brand-green data-[state=checked]:border-brand-green"
          aria-label="Grün - Stimme voll zu"
          iconClassName="fill-brand-green stroke-brand-green size-3"
        />
        {/* Yellow - value 2 */}
        <RadioGroupItem
          value="2"
          className="size-6 md:size-5 border-2 border-brand-yellow data-[state=checked]:border-brand-yellow"
          aria-label="Gelb - Stimme eher zu"
          iconClassName="fill-brand-yellow stroke-brand-yellow size-3"
        />
        {/* Orange - value 3 */}
        <RadioGroupItem
          value="3"
          className="size-6 md:size-5 border-2 border-brand-orange data-[state=checked]:border-brand-orange"
          aria-label="Orange - Stimme eher nicht zu"
          iconClassName="fill-brand-orange stroke-brand-orange size-3"
        />
        {/* Red - value 4 (mapped as 0 in the schema but using 4 for display) */}
        <RadioGroupItem
          value="4"
          className="size-6 md:size-5 border-2 border-brand-coral data-[state=checked]:border-brand-coral"
          aria-label="Rot - Stimme nicht zu"
          iconClassName="fill-brand-coral stroke-brand-coral size-3"
        />

        <RadioGroupItem
          value="0"
          className="size-6 md:size-5 border-2 border-muted-foreground data-[state=checked]:border-muted-foreground"
          aria-label="Keine Antwort"
          iconClassName="fill-muted-foreground stroke-muted-foreground size-3"
        />
      </RadioGroup>
    </div>
  );
};
