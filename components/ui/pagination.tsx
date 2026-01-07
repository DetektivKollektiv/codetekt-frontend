'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { FC } from 'react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  showPageNumbers?: boolean;
  maxPageButtons?: number;
}

export const Pagination: FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
  showPageNumbers = true,
  maxPageButtons = 5,
}) => {
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const getPageNumbers = () => {
    if (totalPages <= maxPageButtons) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | 'ellipsis')[] = [];
    const halfMax = Math.floor(maxPageButtons / 2);

    pages.push(1);

    let startPage = Math.max(2, currentPage - halfMax);
    let endPage = Math.min(totalPages - 1, currentPage + halfMax);

    if (currentPage <= halfMax + 1) {
      endPage = Math.min(maxPageButtons - 1, totalPages - 1);
    }
    if (currentPage >= totalPages - halfMax) {
      startPage = Math.max(2, totalPages - maxPageButtons + 2);
    }

    if (startPage > 2) pages.push('ellipsis');

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages - 1) pages.push('ellipsis');

    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  const pageNumbers = showPageNumbers ? getPageNumbers() : [];

  return (
    <nav
      role="navigation"
      aria-label="Pagination Navigation"
      className={cn('flex items-center gap-1', className)}
    >
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!canGoPrevious}
        aria-label="Vorherige Seite"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {showPageNumbers && (
        <div className="flex items-center gap-1">
          {pageNumbers.map((pageNum, idx) => {
            if (pageNum === 'ellipsis') {
              return (
                <div key={`ellipsis-${idx}`} className="px-2">
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </div>
              );
            }

            const isActive = pageNum === currentPage;
            return (
              <Button
                key={pageNum}
                variant={isActive ? 'default' : 'outline'}
                size="icon"
                onClick={() => onPageChange(pageNum)}
                aria-label={`Seite ${pageNum}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {pageNum}
              </Button>
            );
          })}
        </div>
      )}

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!canGoNext}
        aria-label="Nächste Seite"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
};
