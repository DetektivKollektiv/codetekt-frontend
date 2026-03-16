import { AggregatedReview } from '../queries/getAggregatedReview';
import { AggregatedReviews } from '../queries/getAggregatedReviews';

type CaseDataWithCategory =
  | AggregatedReviews[number]['cases']
  | NonNullable<AggregatedReview>['cases'];

type CaseCategoryInput = AggregatedReviews[number] | CaseDataWithCategory;

export const getCaseCategoryName = (caseItem: CaseCategoryInput) => {
  const caseData = 'cases' in caseItem ? caseItem.cases : caseItem;
  const category =
    'case_categories' in caseData ? caseData.case_categories?.value : undefined;

  switch (category) {
    case 'satire':
      return 'Satire';
    case 'report':
      return 'Bericht';
    case 'text_message':
      return 'Textnachricht';
    case 'opinion':
      return 'Meinung';
    default:
      return category;
  }
};
