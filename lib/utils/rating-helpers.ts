import { ReviewTemplate } from '../queries/getReviewTemplate';
import { ReviewAggregationData } from '../schemas';

export type RatingLevel = 0 | 1 | 2 | 3;

export interface RatingStyle {
  label: string;

  backgroundColor: string;
  foregroundColor: string;

  backgroundClass: string;
  textClass: string;
  textForegroundClass: string;
}

export const scoreToIndex = (score: number): RatingLevel => {
  return Math.ceil(score) as RatingLevel;
};
/**
 * Determines the rating style based on the score
 * @param score - The score from 0-3
 * @returns RatingStyle object with label, Tailwind color classes, and inline style colors
 */
export function getRatingStyle(score: number): RatingStyle {
  const s = scoreToIndex(score);
  if (s < 1) {
    return {
      label: 'Vertrauenswürdig',
      backgroundColor: 'hsl(var(--brand-green))',
      foregroundColor: 'hsl(var(--neutral-0))',
      backgroundClass: 'bg-brand-green',
      textClass: 'text-brand-green',
      textForegroundClass: 'text-neutral-0',
    };

    /* return {
      label: 'Vertrauenswürdig',
      background: 'hsl(var(--brand-green))',
      foreground: 'hsl(var(--neutral-0))',
      backgroundClass: 'bg-brand-green',
      textClass: 'text-brand-green',
      textForegroundClass: 'text-neutral-0',
    }; */
  } else if (s < 2) {
    return {
      label: 'Eher vertrauenswürdig',
      backgroundColor: 'hsl(var(--brand-yellow))',
      foregroundColor: 'hsl(var(--neutral-800))',
      backgroundClass: 'bg-brand-yellow',
      textClass: 'text-brand-yellow',
      textForegroundClass: 'text-neutral-800',
    };
  } else if (s < 3) {
    return {
      label: 'Eher nicht vertrauenswürdig',
      backgroundColor: 'hsl(var(--brand-orange))',
      foregroundColor: 'hsl(var(--neutral-0))',
      backgroundClass: 'bg-brand-orange',
      textClass: 'text-brand-orange',
      textForegroundClass: 'text-neutral-0',
    };
  } else {
    return {
      label: 'Nicht vertrauenswürdig',
      backgroundColor: 'hsl(var(--destructive))',
      foregroundColor: 'hsl(var(--neutral-0))',
      backgroundClass: 'bg-destructive',
      textClass: 'text-destructive',
      textForegroundClass: 'text-destructive-foreground',
    };
  }
}

/**
 * Get color for a specific rating level (0-3)
 */
export function getRatingLevelColor(level: RatingLevel): {
  background: string;
  text: string;
} {
  const backgroundColors = {
    0: 'hsl(var(--brand-green))',
    1: 'hsl(var(--brand-yellow))',
    2: 'hsl(var(--brand-orange))',
    3: 'hsl(var(--destructive))',
  };
  const textColors = {
    0: 'hsl(var(--neutral-0))',
    1: 'hsl(var(--neutral-800))',
    2: 'hsl(var(--neutral-0))',
    3: 'hsl(var(--neutral-0))',
  };
  return { background: backgroundColors[level], text: textColors[level] };
}

/**
 * Get label for a specific rating level (0-3)
 */
export function getRatingLevelLabel(level: RatingLevel): string {
  const labels = {
    0: 'Vertrauenswürdig',
    1: 'Eher vertrauenswürdig',
    2: 'Eher nicht vertrauenswürdig',
    3: 'Nicht vertrauenswürdig',
  };
  return labels[level];
}

export interface DistributionEntry {
  level: RatingLevel;
  label: string;
  percentage: number;
  textColor: string;
  backgroundColor: string;
}

/**
 * Transform field data to distribution entries for rendering
 */
export function getDistributionData(field: {
  percentages: { 0: number; 1: number; 2: number; 3: number };
}): DistributionEntry[] {
  return [
    {
      level: 0,
      label: getRatingLevelLabel(0),
      percentage: field.percentages[0],
      textColor: getRatingLevelColor(0).text,
      backgroundColor: getRatingLevelColor(0).background,
    },
    {
      level: 1,
      label: getRatingLevelLabel(1),
      percentage: field.percentages[1],
      textColor: getRatingLevelColor(1).text,
      backgroundColor: getRatingLevelColor(1).background,
    },
    {
      level: 2,
      label: getRatingLevelLabel(2),
      percentage: field.percentages[2],
      textColor: getRatingLevelColor(2).text,
      backgroundColor: getRatingLevelColor(2).background,
    },
    {
      level: 3,
      label: getRatingLevelLabel(3),
      percentage: field.percentages[3],
      textColor: getRatingLevelColor(3).text,
      backgroundColor: getRatingLevelColor(3).background,
    },
  ];
}

/**
 * Get IDs of all fields with the highest rating index (worst rating)
 * @param fields - Array of fields to analyze
 * @returns Set of field IDs that have the highest rating index
 */
export const getFieldsWithHighestIndex = <
  T extends { id: string; type: string; average?: number },
>(
  fields: T[],
): Set<string> => {
  // Get all traffic-light fields with defined averages
  const trafficLightFields = fields.filter(
    (f) => f.type === 'traffic-light' && f.average !== undefined,
  );

  if (trafficLightFields.length === 0) {
    return new Set();
  }

  // Find the highest index (worst rating)
  const highestIndex = Math.max(
    ...trafficLightFields.map((f) => scoreToIndex(f.average!)),
  );

  // Get IDs of all fields with the highest index
  return new Set(
    trafficLightFields
      .filter((f) => scoreToIndex(f.average!) === highestIndex)
      .map((f) => f.id),
  );
};

export const getWarningTags = (reviewData: ReviewAggregationData) => {
  return reviewData.questions
    .flatMap((question) =>
      question.fields.flatMap((field) => {
        if (!('tags' in field)) return [];

        const index = scoreToIndex(field.average);
        return [{ [index]: field.tags[index] }];
      }),
    )
    .sort((a, b) => Number(Object.keys(b)[0]) - Number(Object.keys(a)[0]));
};

export const getPreviewRating = (template: NonNullable<ReviewTemplate>) => {
  const fields = template.flatMap((question) => question.fields);
  const trafficLightFields = fields
    .filter((f) => f.type === 'traffic-light')
    .filter((f) => typeof f.answer_value === 'number' && f.answer_value <= 3);
  console.log('Traffic light fields for preview rating:', trafficLightFields);
  const highestAnswerValue =
    trafficLightFields.length > 0
      ? Math.max(...trafficLightFields.map((f) => f.answer_value as number))
      : null;

  return highestAnswerValue;
};

export const getPreviewRatingStyle = (
  template: NonNullable<ReviewTemplate>,
) => {
  const previewRating = getPreviewRating(template);
  if (previewRating === null) {
    return {
      label: 'Keine Bewertung',
      backgroundColor: 'hsl(var(--neutral-200))',
      foregroundColor: 'hsl(var(--neutral-800))',
      backgroundClass: 'bg-neutral-200',
      textClass: 'text-neutral-200',
      textForegroundClass: 'text-neutral-800',
    } as RatingStyle;
  }
  return getRatingStyle(previewRating);
};
