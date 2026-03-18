import { AggregatedReview } from '../queries/getAggregatedReview';
import { AggregatedReviews } from '../queries/getAggregatedReviews';
import { getCaseCategoryLabel } from './case-category';

type CaseDataWithCategory =
  | AggregatedReviews[number]['cases']
  | NonNullable<AggregatedReview>['cases'];

type CaseCategoryInput = AggregatedReviews[number] | CaseDataWithCategory;

export const getCaseCategoryName = (caseItem: CaseCategoryInput) => {
  const caseData = 'cases' in caseItem ? caseItem.cases : caseItem;
  const category =
    'case_categories' in caseData ? caseData.case_categories?.value : undefined;

  return getCaseCategoryLabel(category);
};
