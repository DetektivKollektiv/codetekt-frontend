import type { IFuseOptions } from 'fuse.js';

export type SortOption<TItem> = {
  key: string;
  label: string;
  sortFn: (items: TItem[]) => TItem[];
};

// Base config properties that can be looked up
export type ArchiveListConfig<TItem> = {
  renderItem: (item: TItem) => React.ReactNode;
  getItemKey: (item: TItem) => string;
  fuseOptions: IFuseOptions<TItem>;
  sortOptions: SortOption<TItem>[];
  sortPreferenceKey?: string;
  emptyMessage?: string;
  searchPlaceholder?: string;
  itemCountLabel?: (count: number) => string;
  loadingMessage?: string;
};

// Runtime props that are always passed explicitly
type RuntimeProps<TItem> = {
  items: TItem[];
  defaultSortKey?: string;
  pageSize?: number;
  showPageNumbers?: boolean;
  syncWithURL?: boolean;
  className?: React.ComponentProps<'div'>['className'];
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | null;
};

// Option 1: Use config key (new pattern - for server components)
type ArchiveListPropsWithKey<TItem> = RuntimeProps<TItem> & {
  configKey: string;
  renderItem?: never;
  getItemKey?: never;
  fuseOptions?: never;
  sortOptions?: never;
  sortPreferenceKey?: never;
  emptyMessage?: never;
  searchPlaceholder?: never;
  itemCountLabel?: never;
  loadingMessage?: never;
};

// Option 2: Explicit props (old pattern - backward compatibility)
type ArchiveListPropsExplicit<TItem> = RuntimeProps<TItem> & {
  renderItem: (item: TItem) => React.ReactNode;
  getItemKey: (item: TItem) => string;
  fuseOptions: IFuseOptions<TItem>;
  sortOptions: SortOption<TItem>[];
  sortPreferenceKey?: string;
  emptyMessage?: string;
  searchPlaceholder?: string;
  itemCountLabel?: (count: number) => string;
  loadingMessage?: string;
  configKey?: never;
};

// Union type
export type ArchiveListProps<TItem> =
  | ArchiveListPropsWithKey<TItem>
  | ArchiveListPropsExplicit<TItem>;
