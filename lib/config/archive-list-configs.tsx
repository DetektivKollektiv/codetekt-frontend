import { AggregatedReviewCard } from '@/components/archive-list/aggregated-review-card';
import { CaseCard } from '@/components/archive-list/case-card';
import { AggregatedReviews } from '@/lib/queries/getAggregatedReviews';
import { Case } from '../queries/getCase';
import { OpenCases } from '../queries/getOpenCases';
import { UserCases } from '../queries/getUserCases';

// Extract sort functions for reusability
const sortAggregatedReviewsByNewestFirst = (items: AggregatedReviews) => {
  return [...items].sort((a, b) => {
    const bDate = Array.isArray(b.cases)
      ? (b.cases as Case[])[0]?.submitted_at
      : (b.cases as Case)?.submitted_at;
    const aDate = Array.isArray(a.cases)
      ? (a.cases as Case[])[0]?.submitted_at
      : (a.cases as Case)?.submitted_at;
    return new Date(bDate || 0).getTime() - new Date(aDate || 0).getTime();
  });
};

const sortAggregatedReviewsByLastUpdated = (items: AggregatedReviews) => {
  return [...items].sort(
    (a, b) =>
      new Date(b.calculated_at as string).getTime() -
      new Date(a.calculated_at as string).getTime(),
  );
};

const sortReviewsAndUserCasesByNewestFirst = (
  items: (UserCases[number] | AggregatedReviews[number])[],
) => {
  return [...items].sort((a, b) => {
    const dateA = isUserCase(a)
      ? new Date(a.submitted_at!).getTime()
      : new Date(a.calculated_at as string).getTime();
    const dateB = isUserCase(b)
      ? new Date(b.submitted_at!).getTime()
      : new Date(b.calculated_at as string).getTime();
    return dateB - dateA;
  });
};

const sortOpenCasesByNewestFirst = (items: OpenCases) => {
  return [...items].sort((a, b) => {
    return (
      new Date(b.submitted_at!).getTime() - new Date(a.submitted_at!).getTime()
    );
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
      { name: 'cases.case_number', weight: 4 },
      { name: 'cases.open_graph_data.og_title', weight: 4 },
      { name: 'data.metadata.keyword_type', weight: 4 },
      { name: 'cases.content', weight: 2 },
      { name: 'cases.content_type', weight: 2 },
      { name: 'cases.open_graph_data.og_description', weight: 1 },
      { name: 'cases.open_graph_data.og_site_name', weight: 1 },
    ],
    threshold: 0.4,
    ignoreLocation: true,
  },
  sortOptions: [
    {
      key: 'newest_first',
      label: 'Zuletzt eingereicht',
      sortFn: sortAggregatedReviewsByNewestFirst,
    },
    {
      key: 'last_updated',
      label: 'Zuletzt bearbeitet',
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
      { name: 'case_number', weight: 4 },
      { name: 'cases.case_number', weight: 4 },
      { name: 'data.metadata.keyword_type', weight: 4 },
      { name: 'open_graph_data.og_title', weight: 3 },
      { name: 'cases.open_graph_data.og_title', weight: 3 },
      { name: 'content', weight: 2 },
      { name: 'cases.content', weight: 2 },
      { name: 'content_type', weight: 2 },
      { name: 'cases.content_type', weight: 2 },
      { name: 'open_graph_data.og_description', weight: 1 },
      { name: 'cases.open_graph_data.og_description', weight: 1 },
      { name: 'open_graph_data.og_site_name', weight: 1 },
      { name: 'cases.open_graph_data.og_site_name', weight: 1 },
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
  sortPreferenceKey: 'review-case-list-preference',
};

export const casesConfig = {
  renderItem: (item: UserCases[number]) => <CaseCard caseItem={item} />,
  getItemKey: (item: UserCases[number]) => item.id!,
  fuseOptions: {
    keys: [
      { name: 'case_number', weight: 4 },
      { name: 'open_graph_data.og_title', weight: 3 },
      { name: 'content', weight: 2 },
      { name: 'content_type', weight: 2 },
      { name: 'open_graph_data.og_description', weight: 1 },
      { name: 'open_graph_data.og_site_name', weight: 1 },
    ],
    threshold: 0.4,
    ignoreLocation: true,
  },
  sortOptions: [
    {
      key: 'newest_first',
      label: 'Neuste zuerst',
      sortFn: sortOpenCasesByNewestFirst,
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
  item: UserCases[number] | AggregatedReviews[number],
): item is UserCases[number] => {
  return (item as UserCases[number]).id !== undefined;
};

// Config registry for lookup by key
export const archiveListConfigs = {
  aggregatedReviews: aggregatedReviewsListConfig,
  reviewsAndCases: reviewsAndCasesListConfig,
  cases: casesConfig,
  openCases: casesConfig,
} as const;

// Type for config keys
export type ArchiveListConfigKey = keyof typeof archiveListConfigs;
