import { AggregatedReviews } from '../queries/getAggregatedReviews';

export const getCaseCategoryName = (caseItem: AggregatedReviews[number]) => {
  const category = caseItem.cases.case_categories?.value;
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
