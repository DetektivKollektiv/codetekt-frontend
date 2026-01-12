import type { IFuseOptions } from 'fuse.js';

export type SortOption<TItem> = {
  key: string;
  label: string;
  sortFn: (items: TItem[]) => TItem[];
};

export type ArchiveListProps<TItem> = {
  // REQUIRED
  items: TItem[];
  renderItem: (item: TItem) => React.ReactNode;
  getItemKey: (item: TItem) => string;
  fuseOptions: IFuseOptions<TItem>;
  sortOptions: SortOption<TItem>[];

  // OPTIONAL
  defaultSortKey?: string;
  sortPreferenceKey?: string;
  pageSize?: number;
  showPageNumbers?: boolean;
  syncWithURL?: boolean;
  className?: React.ComponentProps<'div'>['className'];

  // State props
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | null;

  // UI customization
  emptyMessage?: string;
  searchPlaceholder?: string;
  itemCountLabel?: (count: number) => string;
  loadingMessage?: string;
};
