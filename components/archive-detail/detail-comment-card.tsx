'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { CaseComments } from '@/lib/queries/getCaseComments';
import { commentLikesQuery } from '@/lib/queries/getCommentLikes';
import { toggleCommentLikeMutation } from '@/lib/queries/toggleCommentLike';
import { createClient } from '@/lib/supabase/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Flag, ThumbsUp } from 'lucide-react';
import { useEffect, useState } from 'react';

interface DetailCommentCardProps {
  comment: CaseComments[number];
  userId?: string;
}

export function DetailCommentCard({ comment, userId }: DetailCommentCardProps) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(false);

  // Fetch likes for this comment
  const { data: likes } = useQuery(commentLikesQuery(supabase, comment.id));

  // Check if current user has liked this comment
  useEffect(() => {
    if (likes && userId) {
      const userLike = likes.find((like) => like.user_id === userId);
      setIsLiked(!!userLike);
    }
  }, [likes, userId]);

  // Mutation for toggling like
  const likeMutation = useMutation({
    ...toggleCommentLikeMutation(supabase, userId || ''),
    onSuccess: () => {
      // Invalidate and refetch likes
      queryClient.invalidateQueries({
        queryKey: ['comment-likes', comment.id],
      });
    },
  });

  const handleLikeClick = () => {
    if (!userId) return; // User must be authenticated

    likeMutation.mutate({
      commentId: comment.id,
      isLiked,
    });
  };

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
  const likeCount = likes?.length || 0;

  return (
    <Card>
      <CardContent className="p-6 h-full">
        <div className="space-y-4 flex flex-col h-full">
          {/* Author info */}
          <div className="flex  gap-3 justify-between">
            <div className="flex gap-3 items-center">
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
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLikeClick}
              disabled={!userId}
              className="gap-2 h-8 px-2 text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              <Flag className="h-4 w-4 text-destructive" />
            </Button>
          </div>

          {/* Comment content */}
          <div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {comment.content}
            </p>
          </div>

          {/* Like button */}
          <div className="flex pt-2 mt-auto flex-1 justify-end items-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLikeClick}
              disabled={!userId || likeMutation.isPending}
              className="gap-2 h-8 px-2 text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              <span className="text-sm font-medium">{likeCount}</span>
              <ThumbsUp
                className="h-4 w-4"
                fill={isLiked ? 'currentColor' : 'none'}
              />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
