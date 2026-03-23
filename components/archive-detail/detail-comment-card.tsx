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
import { commentVotesQuery } from '@/lib/queries/getCommentLikes';
import { commentModerationQuery } from '@/lib/queries/getCommentModeration';
import { commentReportsQuery } from '@/lib/queries/getCommentReports';
import {
  toggleCommentVoteMutation,
  type VoteDirection,
} from '@/lib/queries/toggleCommentLike';
import { createClient } from '@/lib/supabase/client';
import { getAuth } from '@/lib/supabase/getAuth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Flag, Triangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface DetailCommentCardProps {
  comment: CaseComments[number];
  auth: Awaited<ReturnType<typeof getAuth>>;
}

export function DetailCommentCard({ comment, auth }: DetailCommentCardProps) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const { data: authData } = useQuery({
    queryFn: () => getAuth(supabase),
    queryKey: ['auth'],
    initialData: auth,
  });

  const userId = authData.user?.id;
  const [myVote, setMyVote] = useState<VoteDirection | null>(null);
  const [isReported, setIsReported] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');

  // Fetch votes for this comment
  const { data: votes } = useQuery(commentVotesQuery(supabase, comment.id));

  // Fetch reports for this comment
  const { data: reports } = useQuery(commentReportsQuery(supabase, comment.id));

  // Fetch moderation for this comment
  const { data: moderation } = useQuery(
    commentModerationQuery(supabase, comment.id),
  );

  // Check current user vote for this comment
  useEffect(() => {
    if (votes && userId) {
      const userVote = votes.find((vote) => vote.user_id === userId);
      setMyVote((userVote?.vote_type as VoteDirection | undefined) ?? null);
      return;
    }

    setMyVote(null);
  }, [votes, userId]);

  // Check if current user has reported this comment
  useEffect(() => {
    if (reports && userId) {
      const userReport = reports.find(
        (report) => report.reported_by === userId,
      );
      setIsReported(!!userReport);
    }
  }, [reports, userId]);

  // Mutation for toggling vote
  const voteMutation = useMutation({
    ...toggleCommentVoteMutation(supabase, userId || ''),
    onSuccess: () => {
      // Invalidate and refetch votes and comments order
      queryClient.invalidateQueries({
        queryKey: ['comment-votes', comment.id],
      });
      queryClient.invalidateQueries({
        queryKey: ['case-comments', comment.case_id],
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
        'Kommentar erfolgreich gemeldet. Vielen Dank für deine Meldung.',
      );
    },
    onError: (err: Error) => {
      // Show error toast
      toast.error(
        err.message ||
          'Fehler beim Melden des Kommentars. Bitte versuche es erneut.',
      );
    },
  });

  const handleVoteClick = (direction: VoteDirection) => {
    if (!userId || moderation) return; // User must be authenticated and comment not moderated

    voteMutation.mutate({
      commentId: comment.id,
      direction,
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
  const upvoteCount =
    votes?.filter((vote) => vote.vote_type === 'up').length || 0;
  const downvoteCount =
    votes?.filter((vote) => vote.vote_type === 'down').length || 0;
  const score = upvoteCount - downvoteCount;

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

      <Card className="h-auto w-full">
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

            {/* Vote buttons */}
            <div className="flex pt-2 mt-auto flex-1 justify-end items-end gap-1">
              <div className="flex justify-end items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVoteClick('up')}
                  disabled={!userId || voteMutation.isPending || !!moderation}
                  className="h-8 px-2 text-muted-foreground hover:text-foreground disabled:opacity-50 mt-px"
                >
                  <Triangle
                    className="h-4 w-4"
                    fill={myVote === 'up' ? 'currentColor' : 'none'}
                  />
                </Button>
                <span className="text-sm font-medium  text-center">
                  {score}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVoteClick('down')}
                  disabled={!userId || voteMutation.isPending || !!moderation}
                  className="h-8 px-2 text-muted-foreground hover:text-foreground disabled:opacity-50 -mt-px"
                >
                  <Triangle
                    className="h-4 w-4 rotate-180"
                    fill={myVote === 'down' ? 'currentColor' : 'none'}
                  />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
