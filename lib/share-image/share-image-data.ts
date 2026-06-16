import type { AggregatedReview } from '@/lib/queries/getAggregatedReview';
import { getRatingStyle } from '@/lib/utils/rating-helpers';

export interface ShareImageData {
  caseNumber: number;
  title: string;
  source: string;
  submittedAt: string;
  ratingLabel: string;
  ratingBackgroundColor: string;
  ratingForegroundColor: string;
  displayUrl: string;
}

const getSource = (content: string, siteName?: string | null) => {
  if (siteName?.trim()) {
    return siteName.trim();
  }

  try {
    return new URL(content).hostname.replace(/^www\./, '');
  } catch {
    return 'codetekt Community';
  }
};

export const getShareImageData = (
  aggregatedReview: NonNullable<AggregatedReview>,
): ShareImageData => {
  const caseData = aggregatedReview.cases;
  const category = caseData.case_categories?.value;
  const rating = getRatingStyle(aggregatedReview.result_score, category);
  const title =
    caseData.case_titles?.value?.trim() ||
    caseData.open_graph_data?.og_title?.trim() ||
    caseData.content.trim();

  return {
    caseNumber: caseData.case_number,
    title,
    source: getSource(
      caseData.content,
      caseData.open_graph_data?.og_site_name,
    ),
    submittedAt: caseData.submitted_at,
    ratingLabel: rating.label,
    ratingBackgroundColor: rating.backgroundColor,
    ratingForegroundColor: rating.foregroundColor,
    displayUrl: `codetekt.org/fall/${caseData.case_number}`,
  };
};
