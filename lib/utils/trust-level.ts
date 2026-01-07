export interface TrustLevel {
  label: string;
  colorClass: string;
}

/**
 * Determines the trust level based on the result score
 * @param score - The result_score from review_aggregations
 * @returns TrustLevel object with label and Tailwind color classes
 */
export function getTrustLevel(score: number): TrustLevel {
  if (score < 1) {
    return {
      label: 'Nicht vertrauenswürdig',
      colorClass: 'bg-destructive text-destructive-foreground',
    };
  } else if (score < 2) {
    return {
      label: 'Eher nicht vertrauenswürdig',
      colorClass: 'bg-brand-orange text-neutral-0',
    };
  } else if (score < 3) {
    return {
      label: 'Eher vertrauenswürdig',
      colorClass: 'bg-brand-yellow text-neutral-800',
    };
  } else {
    return {
      label: 'Vertrauenswürdig',
      colorClass: 'bg-brand-green text-neutral-0',
    };
  }
}
