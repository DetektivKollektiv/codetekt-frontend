import { AggregatedReviews } from '../queries/getAggregatedReviews';

export const getCaseKeywords = (caseItem: AggregatedReviews[number]) => {
  return (
    caseItem.cases.case_keywords?.map((keyword) => keyword.values).flat() || []
  );
};
