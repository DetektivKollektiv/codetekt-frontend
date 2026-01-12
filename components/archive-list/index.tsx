'use client';

import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import Fuse from 'fuse.js';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Separator } from '../ui/separator';
import {
  ArchiveListSortSelect,
  getSavedSortPreference,
} from './sort-select';
import { ArchiveListProps } from './types';

export const ArchiveList = <TItem,>({
  items,
  renderItem,
  getItemKey,
  fuseOptions,
  sortOptions,
  defaultSortKey,
  sortPreferenceKey = 'archive-sort-preference',
  pageSize = 10,
  showPageNumbers = true,
  syncWithURL = true,
  className,
  isLoading = false,
  isError = false,
  error = null,
  emptyMessage = 'Keine Einträge gefunden.',
  searchPlaceholder = 'Durchsuchen...',
  itemCountLabel = (count) => `${count} ${count === 1 ? 'Eintrag' : 'Einträge'} gefunden`,
  loadingMessage = 'Laden...',
}: ArchiveListProps<TItem>) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Determine default sort
  const defaultSort = defaultSortKey ?? sortOptions[0]?.key ?? '';

  // Internal state for when URL sync is disabled
  const [internalPage, setInternalPage] = useState(1);
  const [internalSort, setInternalSort] = useState<string>(defaultSort);
  const [internalSearch, setInternalSearch] = useState('');

  // Get values from URL or internal state based on syncWithURL
  const currentPage = syncWithURL
    ? parseInt(searchParams.get('page') || '1', 10)
    : internalPage;
  const currentSort = syncWithURL
    ? searchParams.get('sort') || defaultSort
    : internalSort;
  const searchQuery = syncWithURL
    ? searchParams.get('search') || ''
    : internalSearch;

  const [hasCheckedLocalStorage, setHasCheckedLocalStorage] = useState(false);
  const [searchInput, setSearchInput] = useState(searchQuery);

  useEffect(() => {
    if (!syncWithURL || hasCheckedLocalStorage) return;
    setHasCheckedLocalStorage(true);

    const sortKeys = sortOptions.map(opt => opt.key);
    const savedSort = getSavedSortPreference(sortPreferenceKey, sortKeys);
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
    sortOptions,
    sortPreferenceKey,
  ]);

  // Sync searchInput with searchQuery when URL changes
  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  // Configure Fuse.js for searching
  const fuse = useMemo(() => {
    if (!items) return null;
    return new Fuse(items, fuseOptions);
  }, [items, fuseOptions]);

  const searchedItems = useMemo(() => {
    if (!items) return [];
    if (!searchQuery || !fuse) return items;

    const results = fuse.search(searchQuery);
    return results.map((result) => result.item);
  }, [items, searchQuery, fuse]);

  const sortedItems = useMemo(() => {
    const currentSortOption = sortOptions.find(opt => opt.key === currentSort);
    if (!currentSortOption) return searchedItems;
    return currentSortOption.sortFn(searchedItems);
  }, [searchedItems, currentSort, sortOptions]);

  const totalPages = Math.ceil(sortedItems.length / pageSize);
  const validPage = Math.max(1, Math.min(currentPage, totalPages || 1));

  const paginatedItems = useMemo(() => {
    const startIndex = (validPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedItems.slice(startIndex, endIndex);
  }, [sortedItems, validPage, pageSize]);

  const updateURL = (page: number, sort: string, search: string) => {
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
    if (sort !== defaultSort) params.set('sort', sort);
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

  const handleSortChange = (newSort: string) => {
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
          <p className="text-muted-foreground">{loadingMessage}</p>
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

  if (!items || items.length === 0) {
    return (
      <div className={`page-max-w w-full ${className || ''}`}>
        <div className="text-center py-12">
          <p className="text-muted-foreground">{emptyMessage}</p>
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
          placeholder={searchPlaceholder}
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full md:max-w-80 order-last md:order-none"
        />
        <div className="flex-1 flex justify-between items-end w-full">
          <div className="text-sm text-muted-foreground whitespace-nowrap">
            {itemCountLabel(sortedItems.length)}
          </div>
          <ArchiveListSortSelect
            sortOptions={sortOptions}
            value={currentSort}
            onValueChange={handleSortChange}
            storageKey={sortPreferenceKey}
            className="justify-self-end ml-auto"
          />
        </div>
      </div>
      <Separator className="mb-4" />
      <div className="gap-4 flex flex-col md:grid md:grid-cols-2 lg:flex lg:flex-col">
        {paginatedItems.map((item) => (
          <div key={getItemKey(item)}>
            {renderItem(item)}
          </div>
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
