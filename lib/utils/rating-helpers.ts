import type { ReviewAggregationData } from '../schemas/aggregation-schemas';

export type RatingLevel = 0 | 1 | 2 | 3;

export interface RatingStyle {
  label: string;
  colorClass: string;
  background: string;
  text: string;
}

/**
 * Determines the rating style based on the score
 * @param score - The score from 0-3
 * @returns RatingStyle object with label, Tailwind color classes, and inline style colors
 */
export function getRatingStyle(score: number): RatingStyle {
  if (score < 1) {
    return {
      label: 'Nicht vertrauenswürdig',
      colorClass: 'bg-destructive text-destructive-foreground',
      background: 'hsl(var(--brand-coral))',
      text: 'hsl(var(--neutral-0))',
    };
  } else if (score < 2) {
    return {
      label: 'Eher nicht vertrauenswürdig',
      colorClass: 'bg-brand-orange text-neutral-0',
      background: 'hsl(var(--brand-orange))',
      text: 'hsl(var(--neutral-0))',
    };
  } else if (score < 3) {
    return {
      label: 'Eher vertrauenswürdig',
      colorClass: 'bg-brand-yellow text-neutral-800',
      background: 'hsl(var(--brand-yellow))',
      text: 'hsl(var(--neutral-800))',
    };
  } else {
    return {
      label: 'Vertrauenswürdig',
      colorClass: 'bg-brand-green text-neutral-0',
      background: 'hsl(var(--brand-green))',
      text: 'hsl(var(--neutral-0))',
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
    0: 'hsl(var(--brand-coral))',
    1: 'hsl(var(--brand-orange))',
    2: 'hsl(var(--brand-yellow))',
    3: 'hsl(var(--brand-green))',
  };
  const textColors = {
    0: 'hsl(var(--neutral-0))',
    1: 'hsl(var(--neutral-0))',
    2: 'hsl(var(--neutral-800))',
    3: 'hsl(var(--neutral-0))',
  };
  return { background: backgroundColors[level], text: textColors[level] };
}

/**
 * Get label for a specific rating level (0-3)
 */
export function getRatingLevelLabel(level: RatingLevel): string {
  const labels = {
    0: 'Nicht vertrauenswürdig',
    1: 'Eher nicht vertrauenswürdig',
    2: 'Eher vertrauenswürdig',
    3: 'Vertrauenswürdig',
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
      level: 3,
      label: getRatingLevelLabel(3),
      percentage: field.percentages[3],
      textColor: getRatingLevelColor(3).text,
      backgroundColor: getRatingLevelColor(3).background,
    },
    {
      level: 2,
      label: getRatingLevelLabel(2),
      percentage: field.percentages[2],
      textColor: getRatingLevelColor(2).text,
      backgroundColor: getRatingLevelColor(2).background,
    },
    {
      level: 1,
      label: getRatingLevelLabel(1),
      percentage: field.percentages[1],
      textColor: getRatingLevelColor(1).text,
      backgroundColor: getRatingLevelColor(1).background,
    },
    {
      level: 0,
      label: getRatingLevelLabel(0),
      percentage: field.percentages[0],
      textColor: getRatingLevelColor(0).text,
      backgroundColor: getRatingLevelColor(0).background,
    },
  ];
}

/**
 * Extract all warning tags from review fields
 */
export function getWarningTags(
  fields: ReviewAggregationData['fields']
): string[] {
  if (!fields) return [];

  const warnings: string[] = [];
  Object.values(fields).forEach((field) => {
    if (field.warnings && field.warnings.length > 0) {
      warnings.push(...field.warnings);
    }
  });

  return Array.from(new Set(warnings));
}

