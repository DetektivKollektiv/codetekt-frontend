'use client';

import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { archiveListConfigs } from '@/lib/config/archive-list-configs';
import type { IFuseOptions } from 'fuse.js';
import Fuse from 'fuse.js';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Separator } from '../ui/separator';
import { ArchiveListSortSelect, getSavedSortPreference } from './sort-select';
import { ArchiveListProps, SortOption } from './types';

export const ArchiveList = <TItem,>(props: ArchiveListProps<TItem>) => {
  // Extract config from key if provided
  const configFromKey =
    'configKey' in props && props.configKey
      ? archiveListConfigs[props.configKey as keyof typeof archiveListConfigs]
      : null;

  // Destructure with fallbacks to config
  const items = props.items;
  const renderItem = (
    'renderItem' in props ? props.renderItem : configFromKey?.renderItem
  ) as (item: TItem) => React.ReactNode;
  const getItemKey = (
    'getItemKey' in props ? props.getItemKey : configFromKey?.getItemKey
  ) as (item: TItem) => string;
  const fuseOptions = (
    'fuseOptions' in props ? props.fuseOptions : configFromKey?.fuseOptions
  ) as IFuseOptions<TItem>;

  const sortOptions = (
    'sortOptions' in props ? props.sortOptions : configFromKey?.sortOptions
  ) as SortOption<TItem>[];

  const {
    defaultSortKey,
    pageSize = 10,
    showPageNumbers = true,
    syncWithURL = true,
    className,
    isLoading = false,
    isError = false,
    error = null,
  } = props;

  const sortPreferenceKey =
    'configKey' in props
      ? configFromKey?.sortPreferenceKey ?? 'archive-sort-preference'
      : ('sortPreferenceKey' in props ? props.sortPreferenceKey : undefined) ??
        'archive-sort-preference';

  const emptyMessage =
    'configKey' in props
      ? configFromKey?.emptyMessage ?? 'Keine Einträge gefunden.'
      : ('emptyMessage' in props ? props.emptyMessage : undefined) ??
        'Keine Einträge gefunden.';

  const searchPlaceholder =
    'configKey' in props
      ? configFromKey?.searchPlaceholder ?? 'Durchsuchen...'
      : ('searchPlaceholder' in props ? props.searchPlaceholder : undefined) ??
        'Durchsuchen...';

  const itemCountLabel =
    'configKey' in props
      ? configFromKey?.itemCountLabel ??
        ((count: number) =>
          `${count} ${count === 1 ? 'Eintrag' : 'Einträge'} gefunden`)
      : ('itemCountLabel' in props ? props.itemCountLabel : undefined) ??
        ((count: number) =>
          `${count} ${count === 1 ? 'Eintrag' : 'Einträge'} gefunden`);

  const loadingMessage =
    'configKey' in props
      ? configFromKey?.loadingMessage ?? 'Laden...'
      : ('loadingMessage' in props ? props.loadingMessage : undefined) ??
        'Laden...';

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

  useEffect(() => {
    if (!syncWithURL || hasCheckedLocalStorage) return;
    setHasCheckedLocalStorage(true);

    const sortKeys = sortOptions.map((opt) => opt.key);
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
    updateURL,
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

  const searchedItems = useMemo<TItem[]>(() => {
    if (!items) return [];
    if (!searchQuery || !fuse) return items;

    const results = fuse.search(searchQuery);
    return results.map((result) => result.item);
  }, [items, searchQuery, fuse]);

  const sortedItems = useMemo<TItem[]>(() => {
    const currentSortOption = sortOptions.find(
      (opt) => opt.key === currentSort
    );
    if (!currentSortOption) return searchedItems;
    return currentSortOption.sortFn(searchedItems);
  }, [searchedItems, currentSort, sortOptions]);

  const totalPages = Math.ceil(sortedItems.length / pageSize);
  const validPage = Math.max(1, Math.min(currentPage, totalPages || 1));

  const paginatedItems = useMemo<TItem[]>(() => {
    const startIndex = (validPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedItems.slice(startIndex, endIndex);
  }, [sortedItems, validPage, pageSize]);

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
          disabled={sortedItems.length === 0}
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
            disabled={sortedItems.length === 0}
          />
        </div>
      </div>
      <Separator className="mb-4" />
      <div
        className={`gap-4 flex flex-col  lg:flex lg:flex-col ${
          items && items.length > 0 ? 'md:grid md:grid-cols-2' : ''
        } `}
      >
        {isLoading ? (
          <Card className="overflow-hidden hover:shadow-lg transition-shadow h-48 lg:h-72 w-full flex bg-muted">
            <CardContent className="p-4 lg:p-6 w-full flex items-center justify-center">
              <p className="text-muted-foreground">{loadingMessage}</p>
            </CardContent>
          </Card>
        ) : isError ? (
          <Card className="overflow-hidden hover:shadow-lg transition-shadow h-48 lg:h-72 w-full flex bg-muted">
            <CardContent className="p-4 lg:p-6 w-full flex items-center justify-center">
              <p className="text-destructive">
                Fehler beim Laden: {error?.message}
              </p>
            </CardContent>
          </Card>
        ) : !items || items.length === 0 ? (
          <Card className="overflow-hidden hover:shadow-lg transition-shadow h-48 lg:h-72 w-full flex bg-muted ">
            <CardContent className="p-4 lg:p-6 w-full flex items-center justify-center">
              <p className="text-muted-foreground">{emptyMessage}</p>
            </CardContent>
          </Card>
        ) : (
          paginatedItems.map((item) => (
            <div key={getItemKey(item)}>{renderItem(item)}</div>
          ))
        )}
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
