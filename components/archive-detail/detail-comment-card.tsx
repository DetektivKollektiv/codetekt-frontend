'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createCommentReportMutation } from '@/lib/queries/createCommentReport';
import type { CaseComments } from '@/lib/queries/getCaseComments';
import { commentLikesQuery } from '@/lib/queries/getCommentLikes';
import { commentModerationQuery } from '@/lib/queries/getCommentModeration';
import { commentReportsQuery } from '@/lib/queries/getCommentReports';
import { toggleCommentLikeMutation } from '@/lib/queries/toggleCommentLike';
import { createClient } from '@/lib/supabase/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Flag, ThumbsUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface DetailCommentCardProps {
  comment: CaseComments[number];
  userId?: string;
}

export function DetailCommentCard({ comment, userId }: DetailCommentCardProps) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(false);
  const [isReported, setIsReported] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');

  // Fetch likes for this comment
  const { data: likes } = useQuery(commentLikesQuery(supabase, comment.id));

  // Fetch reports for this comment
  const { data: reports } = useQuery(commentReportsQuery(supabase, comment.id));

  // Fetch moderation for this comment
  const { data: moderation } = useQuery(
    commentModerationQuery(supabase, comment.id)
  );

  // Check if current user has liked this comment
  useEffect(() => {
    if (likes && userId) {
      const userLike = likes.find((like) => like.user_id === userId);
      setIsLiked(!!userLike);
    }
  }, [likes, userId]);

  // Check if current user has reported this comment
  useEffect(() => {
    if (reports && userId) {
      const userReport = reports.find(
        (report) => report.reported_by === userId
      );
      setIsReported(!!userReport);
    }
  }, [reports, userId]);

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

  // Mutation for creating report
  const reportMutation = useMutation({
    ...createCommentReportMutation(supabase, userId || ''),
    onSuccess: () => {
      // Invalidate and refetch reports
      queryClient.invalidateQueries({
        queryKey: ['comment-reports', comment.id],
      });
      // Close dialog and reset form
      setIsDialogOpen(false);
      setReportReason('');
      // Show success toast
      toast.success(
        'Kommentar erfolgreich gemeldet. Vielen Dank für deine Meldung.'
      );
    },
    onError: (err: Error) => {
      // Show error toast
      toast.error(
        err.message ||
          'Fehler beim Melden des Kommentars. Bitte versuche es erneut.'
      );
    },
  });

  const handleLikeClick = () => {
    if (!userId || moderation) return; // User must be authenticated and comment not moderated

    likeMutation.mutate({
      commentId: comment.id,
      isLiked,
    });
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !reportReason.trim()) return;

    reportMutation.mutate({
      commentId: comment.id,
      reason: reportReason,
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
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleReportSubmit}>
            <DialogHeader>
              <DialogTitle>Kommentar melden</DialogTitle>
              <DialogDescription>
                Bitte geben Sie den Grund für die Meldung an. Unser Team wird
                den Kommentar überprüfen.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-3">
                <Label htmlFor="reason">Grund der Meldung</Label>
                <Textarea
                  id="reason"
                  placeholder="Beschreiben Sie, warum dieser Kommentar gemeldet werden sollte..."
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  required
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" type="button">
                  Abbrechen
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={!reportReason.trim() || reportMutation.isPending}
              >
                {reportMutation.isPending ? 'Wird gesendet...' : 'Melden'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card className="h-auto">
        <CardContent className="p-6 h-full relative overflow-hidden">
          {moderation && (
            <div className="absolute inset-0 w-full h-full rounded-lg p-2 z-20">
              <div className="w-full h-full bg-background/90 flex flex-col justify-center items-center gap-2 px-4">
                <p className="text-body-md font-bold">
                  Dieser Kommentar wurde moderiert.
                </p>
                <p className="text-sm text-muted-foreground text-center">
                  {moderation.reason}
                </p>
              </div>
            </div>
          )}
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
                onClick={() => setIsDialogOpen(true)}
                disabled={!userId || isReported || !!moderation}
                className="gap-2 h-8 px-2 text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                <Flag
                  className="h-4 w-4 text-destructive"
                  fill={isReported ? 'currentColor' : 'none'}
                />
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
                disabled={!userId || likeMutation.isPending || !!moderation}
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
    </>
  );
}
