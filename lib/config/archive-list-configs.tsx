import { AggregatedReviewCard } from '@/components/archive-list/aggregated-review-card';
import { CaseCard } from '@/components/archive-list/case-card';
import { AggregatedReviews } from '@/lib/queries/getAggregatedReviews';
import { UserCases } from '../queries/getUserCases';

// Extract sort functions for reusability
const sortAggregatedReviewsByNewestFirst = (items: AggregatedReviews) => {
  return [...items].sort((a, b) => {
    const bDate = Array.isArray(b.cases)
      ? (b.cases as any)[0]?.submitted_at
      : (b.cases as any)?.submitted_at;
    const aDate = Array.isArray(a.cases)
      ? (a.cases as any)[0]?.submitted_at
      : (a.cases as any)?.submitted_at;
    return new Date(bDate || 0).getTime() - new Date(aDate || 0).getTime();
  });
};

const sortAggregatedReviewsByLastUpdated = (items: AggregatedReviews) => {
  return [...items].sort(
    (a, b) =>
      new Date(b.calculated_at).getTime() - new Date(a.calculated_at).getTime()
  );
};

const sortReviewsAndUserCasesByNewestFirst = (
  items: (UserCases[number] | AggregatedReviews[number])[]
) => {
  return [...items].sort((a, b) => {
    const dateA = isUserCase(a)
      ? new Date(a.submitted_at!).getTime()
      : new Date(a.calculated_at).getTime();
    const dateB = isUserCase(b)
      ? new Date(b.submitted_at!).getTime()
      : new Date(b.calculated_at).getTime();
    return dateB - dateA;
  });
};

// Configuration for AggregatedReviews
export const aggregatedReviewsListConfig = {
  renderItem: (item: AggregatedReviews[number]) => (
    <AggregatedReviewCard caseItem={item} />
  ),
  getItemKey: (item: AggregatedReviews[number]) => item.case_id,
  fuseOptions: {
    keys: [
      { name: 'cases.open_graph_data.og_title', weight: 3 },
      { name: 'data.metadata.content_type', weight: 2 },
      { name: 'data.metadata.keyword_type', weight: 2 },
      { name: 'data.data', weight: 2 },
      { name: 'cases.open_graph_data.og_description', weight: 1 },
    ],
    threshold: 0.4,
    ignoreLocation: true,
  },
  sortOptions: [
    {
      key: 'newest_first',
      label: 'Neuste zuerst',
      sortFn: sortAggregatedReviewsByNewestFirst,
    },
    {
      key: 'last_updated',
      label: 'Zuletzt geupdated',
      sortFn: sortAggregatedReviewsByLastUpdated,
    },
  ],
  searchPlaceholder: 'Fälle durchsuchen...',
  itemCountLabel: (count: number) =>
    `${count} ${count === 1 ? 'Fall' : 'Fälle'} gefunden`,
  emptyMessage: 'Keine Fälle im Archiv gefunden.',
  loadingMessage: 'Lade Archiv...',
  sortPreferenceKey: 'archive-sort-preference',
};

export const reviewsAndCasesListConfig = {
  renderItem: (item: UserCases[number] | AggregatedReviews[number]) =>
    isUserCase(item) ? (
      <CaseCard caseItem={item} />
    ) : (
      <AggregatedReviewCard caseItem={item as AggregatedReviews[number]} />
    ),
  getItemKey: (item: UserCases[number] | AggregatedReviews[number]) =>
    isUserCase(item) ? item.id! : item.case_id,
  fuseOptions: {
    keys: [
      { name: 'cases.open_graph_data.og_title', weight: 3 },
      { name: 'data.metadata.content_type', weight: 2 },
      { name: 'data.metadata.keyword_type', weight: 2 },
      { name: 'data.data', weight: 2 },
      { name: 'cases.open_graph_data.og_description', weight: 1 },
    ],
    threshold: 0.4,
    ignoreLocation: true,
  },
  sortOptions: [
    {
      key: 'newest_first',
      label: 'Neuste zuerst',
      sortFn: sortReviewsAndUserCasesByNewestFirst,
    },
  ],
  searchPlaceholder: 'Fälle durchsuchen...',
  itemCountLabel: (count: number) =>
    `${count} ${count === 1 ? 'Fall' : 'Fälle'} gefunden`,
  emptyMessage: 'Keine Fälle im Archiv gefunden.',
  loadingMessage: 'Lade Archiv...',
  sortPreferenceKey: 'case-list-preference',
};

export const isUserCase = (
  item: UserCases[number] | AggregatedReviews[number]
): item is UserCases[number] => {
  return (item as UserCases[number]).id !== undefined;
};

// Config registry for lookup by key
export const archiveListConfigs = {
  aggregatedReviews: aggregatedReviewsListConfig,
  reviewsAndCases: reviewsAndCasesListConfig,
} as const;

// Type for config keys
export type ArchiveListConfigKey = keyof typeof archiveListConfigs;
