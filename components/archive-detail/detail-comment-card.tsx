'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import type { CaseComments } from '@/lib/queries/getCaseComments';

interface DetailCommentCardProps {
  comment: CaseComments[number];
}

export function DetailCommentCard({ comment }: DetailCommentCardProps) {
  // Get initials for avatar fallback
  const getInitials = (username: string | null) => {
    if (!username) return '?';
    return username
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const createdAt = new Date(comment.created_at);
  const isEdited = comment.edited_at !== null;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Author info */}
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>
                {getInitials(comment.profiles?.username || null)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">
                {comment.profiles?.username || 'Unbekannt'}
              </p>
              <p className="text-xs text-muted-foreground">
                {format(createdAt, 'PPP', { locale: de })}
                {isEdited && (
                  <span className="ml-2 italic">(Bearbeitet)</span>
                )}
              </p>
            </div>
          </div>

          {/* Comment content */}
          <div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {comment.content}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
