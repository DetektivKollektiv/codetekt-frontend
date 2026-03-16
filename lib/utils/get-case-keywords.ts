import { AggregatedReview } from '../queries/getAggregatedReview';
import { AggregatedReviews } from '../queries/getAggregatedReviews';

type CaseItemWithKeywords =
  | AggregatedReviews[number]
  | NonNullable<AggregatedReview>;

export const getCaseKeywords = (caseItem: CaseItemWithKeywords) => {
  const caseKeywords =
    'case_keywords' in caseItem.cases
      ? caseItem.cases.case_keywords
      : undefined;

  return [...new Set(caseKeywords?.flatMap((keyword) => keyword.values) || [])];
};
