'use client';

import { ArchiveItemCard } from '@/components/archive-item-card';
import {
  ArchiveListSortSelect,
  getSavedSortPreference,
  SortField,
} from '@/components/archive-list-sort-select';
import { Pagination } from '@/components/ui/pagination';
import {
  AggregatedReviews,
  aggregatedReviewsQuery,
} from '@/lib/queries/getAggregatedReviews';
import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { FC, useEffect, useMemo, useState } from 'react';

type ArchiveListProps = {
  initialData?: AggregatedReviews;
  pageSize?: number;
  showPageNumbers?: boolean;
};

export const ArchiveList: FC<ArchiveListProps> = ({
  initialData,
  pageSize = 10,
  showPageNumbers = true,
}) => {
  const client = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentSort =
    (searchParams.get('sort') as SortField) || 'newest_first';

  const [hasCheckedLocalStorage, setHasCheckedLocalStorage] = useState(false);

  const {
    data: aggregatedReviews,
    isLoading,
    isError,
    error,
  } = useQuery({
    ...aggregatedReviewsQuery(client),
    initialData,
  });

  useEffect(() => {
    if (hasCheckedLocalStorage) return;
    setHasCheckedLocalStorage(true);

    const savedSort = getSavedSortPreference();
    if (savedSort && savedSort !== currentSort && !searchParams.has('sort')) {
      updateURL(currentPage, savedSort);
    }
  }, [hasCheckedLocalStorage, currentSort, currentPage, searchParams]);

  const sortByNewestFirst = (items: AggregatedReviews) => {
    return [...items].sort(
      (a, b) =>
        new Date(b.cases.submitted_at).getTime() -
        new Date(a.cases.submitted_at).getTime()
    );
  };

  const sortByLastUpdated = (items: AggregatedReviews) => {
    return [...items].sort(
      (a, b) =>
        new Date(b.calculated_at).getTime() -
        new Date(a.calculated_at).getTime()
    );
  };

  const sortedItems = useMemo(() => {
    if (!aggregatedReviews) return [];

    if (currentSort === 'newest_first') {
      return sortByNewestFirst(aggregatedReviews);
    } else {
      return sortByLastUpdated(aggregatedReviews);
    }
  }, [aggregatedReviews, currentSort]);

  const totalPages = Math.ceil(sortedItems.length / pageSize);
  const validPage = Math.max(1, Math.min(currentPage, totalPages || 1));

  const paginatedItems = useMemo(() => {
    const startIndex = (validPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedItems.slice(startIndex, endIndex);
  }, [sortedItems, validPage, pageSize]);

  const updateURL = (page: number, sort: SortField) => {
    const params = new URLSearchParams();
    if (page !== 1) params.set('page', String(page));
    if (sort !== 'newest_first') params.set('sort', sort);

    const queryString = params.toString();
    const newURL = queryString ? `/archive?${queryString}` : '/archive';

    router.push(newURL, { scroll: false });
  };

  const handlePageChange = (newPage: number) => {
    updateURL(newPage, currentSort);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (newSort: SortField) => {
    updateURL(1, newSort);
  };

  if (isLoading) {
    return (
      <div className="page-max-w w-full">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Lade Archiv...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="page-max-w w-full">
        <div className="text-center py-12">
          <p className="text-destructive">
            Fehler beim Laden: {error?.message}
          </p>
        </div>
      </div>
    );
  }

  if (!aggregatedReviews || aggregatedReviews.length === 0) {
    return (
      <div className="page-max-w w-full">
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Keine Fälle im Archiv gefunden.
          </p>
        </div>
      </div>
    );
  }

  const showPagination = totalPages > 1;

  return (
    <div className="page-max-w w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="text-sm text-muted-foreground">
          {sortedItems.length} {sortedItems.length === 1 ? 'Fall' : 'Fälle'}{' '}
          gefunden
        </div>

        <ArchiveListSortSelect
          value={currentSort}
          onValueChange={handleSortChange}
        />
      </div>

      {showPagination && (
        <div className="mb-6 flex justify-center">
          <Pagination
            currentPage={validPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            showPageNumbers={showPageNumbers}
          />
        </div>
      )}

      <div className="gap-4 flex flex-col md:grid md:grid-cols-2 lg:flex lg:flex-col">
        {paginatedItems.map((caseItem) => (
          <ArchiveItemCard key={caseItem.case_id} caseItem={caseItem} />
        ))}
      </div>

      {showPagination && (
        <div className="mt-6 flex justify-center">
          <Pagination
            currentPage={validPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            showPageNumbers={showPageNumbers}
          />
        </div>
      )}
    </div>
  );
};
