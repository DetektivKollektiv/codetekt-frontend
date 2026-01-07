/**
 * Extracts warning tags from review aggregation field data
 * @param fields - The data.fields object from review_aggregations
 * @returns Array of German warning labels
 */
export function getWarningTags(fields: Record<string, any>): string[] {
  const warnings: string[] = [];

  // Field name to German label mapping
  const fieldLabels: Record<string, string> = {
    grammar: 'Fehlerhafte Grammatik',
    headline: 'Problematische Überschrift',
    structure: 'Strukturprobleme',
    objectivity: 'Mangelnde Objektivität',
    perspectives: 'Fehlende Perspektiven',
    images_quality: 'Bildqualität',
    external_sources: 'Fehlende Quellen',
    additional_rating: 'Zusätzliche Bewertung',
    author_credentials: 'Autorenangaben',
    public_media_match: 'Öffentliche Medien',
    claims_match_sources: 'Quellenabgleich',
  };

  // Iterate through fields and check for warnings
  for (const [fieldKey, fieldValue] of Object.entries(fields)) {
    if (shouldShowWarning(fieldValue)) {
      const label = fieldLabels[fieldKey];
      if (label) {
        warnings.push(label);
      }
    }
  }

  return warnings;
}

/**
 * Determines if a field value indicates a warning condition
 * @param fieldValue - The value of a field from data.fields
 * @returns true if the field indicates a warning
 */
function shouldShowWarning(fieldValue: any): boolean {
  if (typeof fieldValue === 'object' && fieldValue !== null) {
    // Check for average score pattern (lower scores indicate issues)
    if ('average' in fieldValue && typeof fieldValue.average === 'number') {
      return fieldValue.average < 2;
    }

    // Check for warnings array pattern
    if (
      'warnings' in fieldValue &&
      Array.isArray(fieldValue.warnings) &&
      fieldValue.warnings.length > 0
    ) {
      return true;
    }

    // Check for counts pattern where count at index 0 (low score) is high
    if ('counts' in fieldValue && typeof fieldValue.counts === 'object') {
      const counts = fieldValue.counts;
      // If more than half of counts are in the 0 or 1 category
      if (typeof counts['0'] === 'number' && typeof counts['1'] === 'number') {
        const lowScoreCounts = (counts['0'] || 0) + (counts['1'] || 0);
        const totalCounts = Object.values(counts).reduce(
          (sum: number, count: any) => sum + (typeof count === 'number' ? count : 0),
          0
        );
        return totalCounts > 0 && lowScoreCounts / totalCounts > 0.5;
      }
    }
  }

  return false;
}
