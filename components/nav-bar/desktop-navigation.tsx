'use client';

import { ChevronDown } from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/lib/utils';

// shadcn

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Button } from '@/components/ui/button';
import { NavLink } from '@/lib/types';

export default function DesktopNavigation({ items }: { items: NavLink[] }) {
  return (
    <nav className="hidden lg:flex items-center gap-1">
      {items.map((item) => {
        const hasChildren = Boolean(item.children?.length);

        // Simple link (kein Dropdown)
        if (!hasChildren) {
          return (
            <Button
              key={item.label}
              asChild
              variant="ghost"
              className={cn(
                'text-body-md font-medium',
                item.highlight && 'text-primary',
              )}
            >
              <Link href={item.href}>{item.label}</Link>
            </Button>
          );
        }

        // Dropdown
        return (
          <DropdownMenu key={item.label}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  'flex items-center gap-1 text-body-md font-medium',
                  item.highlight && 'text-primary',
                )}
              >
                {item.label}
                <ChevronDown className="h-4 w-4 opacity-70" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start" className="min-w-[220px]">
              {item.children!.map((child) => (
                <DropdownMenuItem
                  key={child.label}
                  asChild
                  className="text-body-md"
                >
                  <Link href={child.href}>{child.label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      })}
    </nav>
  );
}
