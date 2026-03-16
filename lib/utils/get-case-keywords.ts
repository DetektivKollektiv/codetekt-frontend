import { AggregatedReview } from '../queries/getAggregatedReview';
import { AggregatedReviews } from '../queries/getAggregatedReviews';
import { Case } from '../queries/getCase';

type CaseItemWithKeywords =
  | AggregatedReviews[number]
  | NonNullable<AggregatedReview>
  | NonNullable<Case>;

export const getCaseKeywords = (caseItem: CaseItemWithKeywords) => {
  const caseObj = 'cases' in caseItem ? caseItem.cases : caseItem;
  const caseKeywords = caseObj?.case_keywords;

  return [...new Set(caseKeywords?.flatMap((keyword) => keyword.values) || [])];
};
