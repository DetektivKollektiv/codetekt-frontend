import type { ReviewAggregationData } from '../schemas/aggregation-schemas';

export type RatingLevel = 0 | 1 | 2 | 3;

export type RatingKey =
  | 'untrusted'
  | 'mostly-untrusted'
  | 'mostly-trusted'
  | 'trusted';

export interface RatingLabelInfo {
  key: RatingKey;
  label: string;
  shortLabel: string;
  colorClass: string;
  bgColorClass: string;
  borderColorClass: string;
  gradientFrom: string;
  gradientTo: string;
}

export const ratingInfo: Record<RatingKey, RatingLabelInfo> = {
  untrusted: {
    key: 'untrusted',
    label: 'Nicht vertrauenswürdig',
    shortLabel: 'Nicht vertrauenswürdig',
    colorClass: 'text-brand-coral-dark',
    bgColorClass: 'bg-brand-coral-light',
    borderColorClass: 'border-brand-coral',
    gradientFrom: 'hsl(var(--brand-coral-dark))',
    gradientTo: 'hsl(var(--brand-coral))',
  },
  'mostly-untrusted': {
    key: 'mostly-untrusted',
    label: 'Eher nicht vertrauenswürdig',
    shortLabel: 'Eher nicht vertrauenswürdig',
    colorClass: 'text-brand-orange-dark',
    bgColorClass: 'bg-brand-orange-light',
    borderColorClass: 'border-brand-orange',
    gradientFrom: 'hsl(var(--brand-orange-dark))',
    gradientTo: 'hsl(var(--brand-orange))',
  },
  'mostly-trusted': {
    key: 'mostly-trusted',
    label: 'Eher vertrauenswürdig',
    shortLabel: 'Eher vertrauenswürdig',
    colorClass: 'text-brand-yellow-dark',
    bgColorClass: 'bg-brand-yellow-light',
    borderColorClass: 'border-brand-yellow',
    gradientFrom: 'hsl(var(--brand-yellow-dark))',
    gradientTo: 'hsl(var(--brand-yellow))',
  },
  trusted: {
    key: 'trusted',
    label: 'Vertrauenswürdig',
    shortLabel: 'Vertrauenswürdig',
    colorClass: 'text-brand-green-dark',
    bgColorClass: 'bg-brand-green-light',
    borderColorClass: 'border-brand-green',
    gradientFrom: 'hsl(var(--brand-green-dark))',
    gradientTo: 'hsl(var(--brand-green))',
  },
};

/**
 * Convert a numeric score to a rating key
 */
export function getRatingKey(score: number): RatingKey {
  if (score >= 2.5) return 'trusted';
  if (score >= 1.5) return 'mostly-trusted';
  if (score >= 0.5) return 'mostly-untrusted';
  return 'untrusted';
}

/**
 * Get rating info for a given score
 */
export function getRatingInfo(score: number): RatingLabelInfo {
  const key = getRatingKey(score);
  return ratingInfo[key];
}

/**
 * Get color for a specific rating level (0-3)
 */
export function getRatingLevelColor(level: RatingLevel): string {
  const colors = {
    0: 'hsl(var(--brand-coral))',
    1: 'hsl(var(--brand-orange))',
    2: 'hsl(var(--brand-yellow))',
    3: 'hsl(var(--brand-green))',
  };
  return colors[level];
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
  color: string;
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
      color: getRatingLevelColor(3),
    },
    {
      level: 2,
      label: getRatingLevelLabel(2),
      percentage: field.percentages[2],
      color: getRatingLevelColor(2),
    },
    {
      level: 1,
      label: getRatingLevelLabel(1),
      percentage: field.percentages[1],
      color: getRatingLevelColor(1),
    },
    {
      level: 0,
      label: getRatingLevelLabel(0),
      percentage: field.percentages[0],
      color: getRatingLevelColor(0),
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

/**
 * Format average score for display (e.g., 2.5 -> "2.5")
 */
export function formatAverageScore(score: number): string {
  return score.toFixed(1);
}
