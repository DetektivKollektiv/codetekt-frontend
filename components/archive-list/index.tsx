'use client';

import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import {
  AggregatedReviews,
  aggregatedReviewsQuery,
} from '@/lib/queries/getAggregatedReviews';
import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';
import Fuse from 'fuse.js';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FC, useEffect, useMemo, useState } from 'react';
import { Separator } from '../ui/separator';
import { ArchiveItemCard } from './card';
import {
  ArchiveListSortSelect,
  getSavedSortPreference,
  SortField,
} from './sort-select';

type ArchiveListProps = {
  initialData?: AggregatedReviews;
  pageSize?: number;
  showPageNumbers?: boolean;
  className?: React.ComponentProps<'div'>['className'];
  syncWithURL?: boolean;
};

export const ArchiveList: FC<ArchiveListProps> = ({
  initialData,
  pageSize = 10,
  showPageNumbers = true,
  className,
  syncWithURL = true,
}) => {
  const client = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Internal state for when URL sync is disabled
  const [internalPage, setInternalPage] = useState(1);
  const [internalSort, setInternalSort] = useState<SortField>('newest_first');
  const [internalSearch, setInternalSearch] = useState('');

  // Get values from URL or internal state based on syncWithURL
  const currentPage = syncWithURL
    ? parseInt(searchParams.get('page') || '1', 10)
    : internalPage;
  const currentSort = syncWithURL
    ? (searchParams.get('sort') as SortField) || 'newest_first'
    : internalSort;
  const searchQuery = syncWithURL
    ? searchParams.get('search') || ''
    : internalSearch;

  const [hasCheckedLocalStorage, setHasCheckedLocalStorage] = useState(false);
  const [searchInput, setSearchInput] = useState(searchQuery);

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
    if (!syncWithURL || hasCheckedLocalStorage) return;
    setHasCheckedLocalStorage(true);

    const savedSort = getSavedSortPreference();
    if (savedSort && savedSort !== currentSort && !searchParams.has('sort')) {
      updateURL(currentPage, savedSort, searchQuery);
    }
  }, [
    syncWithURL,
    hasCheckedLocalStorage,
    currentSort,
    currentPage,
    searchParams,
    searchQuery,
  ]);

  // Sync searchInput with searchQuery when URL changes
  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  const sortByNewestFirst = (items: AggregatedReviews) => {
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

  const sortByLastUpdated = (items: AggregatedReviews) => {
    return [...items].sort(
      (a, b) =>
        new Date(b.calculated_at).getTime() -
        new Date(a.calculated_at).getTime()
    );
  };

  // Configure Fuse.js for searching
  const fuse = useMemo(() => {
    if (!aggregatedReviews) return null;

    return new Fuse(aggregatedReviews, {
      keys: [
        { name: 'cases.open_graph_data.og_title', weight: 3 },
        { name: 'data.metadata.content_type', weight: 2 },
        { name: 'data.metadata.keyword_type', weight: 2 },
        { name: 'cases.open_graph_data.og_description', weight: 1 },
      ],
      threshold: 0.4,
      ignoreLocation: true,
    });
  }, [aggregatedReviews]);

  const searchedItems = useMemo(() => {
    if (!aggregatedReviews) return [];
    if (!searchQuery || !fuse) return aggregatedReviews;

    const results = fuse.search(searchQuery);
    return results.map((result) => result.item);
  }, [aggregatedReviews, searchQuery, fuse]);

  const sortedItems = useMemo(() => {
    if (currentSort === 'newest_first') {
      return sortByNewestFirst(searchedItems);
    } else {
      return sortByLastUpdated(searchedItems);
    }
  }, [searchedItems, currentSort]);

  const totalPages = Math.ceil(sortedItems.length / pageSize);
  const validPage = Math.max(1, Math.min(currentPage, totalPages || 1));

  const paginatedItems = useMemo(() => {
    const startIndex = (validPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedItems.slice(startIndex, endIndex);
  }, [sortedItems, validPage, pageSize]);

  const updateURL = (page: number, sort: SortField, search: string) => {
    if (!syncWithURL) {
      // Update internal state when URL sync is disabled
      setInternalPage(page);
      setInternalSort(sort);
      setInternalSearch(search);
      return;
    }

    // Update URL when sync is enabled
    const params = new URLSearchParams();
    if (page !== 1) params.set('page', String(page));
    if (sort !== 'newest_first') params.set('sort', sort);
    if (search) params.set('search', search);

    const queryString = params.toString();
    const newURL = queryString ? `${pathname}?${queryString}` : pathname;

    router.push(newURL, { scroll: false });
  };

  const handlePageChange = (newPage: number) => {
    updateURL(newPage, currentSort, searchQuery);
    if (syncWithURL) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSortChange = (newSort: SortField) => {
    updateURL(1, newSort, searchQuery);
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    updateURL(1, currentSort, value);
  };

  if (isLoading) {
    return (
      <div className={`page-max-w w-full ${className || ''}`}>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Lade Archiv...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={`page-max-w w-full ${className || ''}`}>
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
      <div className={`page-max-w w-full ${className || ''}`}>
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
    <div className={`page-max-w w-full ${className || ''}`}>
      <div className="flex flex-col md:flex-row md:justify-start md:items-end gap-2 w-full mb-4">
        <Input
          type="text"
          placeholder="Fälle durchsuchen..."
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full md:max-w-80 order-last md:order-none"
        />
        <div className="flex-1 flex justify-between items-end w-full">
          <div className="text-sm text-muted-foreground whitespace-nowrap">
            {sortedItems.length} {sortedItems.length === 1 ? 'Fall' : 'Fälle'}{' '}
            gefunden
          </div>
          <ArchiveListSortSelect
            value={currentSort}
            onValueChange={handleSortChange}
            className=" justify-self-end ml-auto"
          />
        </div>
      </div>
      <Separator className="mb-4" />
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
