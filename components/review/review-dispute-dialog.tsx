'use client';

import { createReviewDisputeMutation } from '@/lib/queries/createReviewDispute';
import { Field } from '@/lib/schemas';
import { createClient } from '@/lib/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

interface ReviewDisputeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  disputingField: Field | null;
  caseId: string;
  userId?: string;
  onSuccess?: () => Promise<void> | void;
}

const ReviewDisputeDialog = ({
  isOpen,
  onOpenChange,
  disputingField,
  caseId,
  userId,
  onSuccess,
}: ReviewDisputeDialogProps) => {
  const supabase = createClient();
  const [disputeReason, setDisputeReason] = useState('');
  const queryClient = useQueryClient();

  const { mutate: createDispute, isPending: isDisputeSubmitting } = useMutation(
    {
      ...createReviewDisputeMutation(supabase, userId || ''),
      onSuccess: async () => {
        toast.success(
          'Korrektur erfolgreich beantragt. Unser Team wird die Bewertung überprüfen.',
        );
        setDisputeReason('');
        onOpenChange(false);
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['case', caseId] }),
          queryClient.invalidateQueries({
            queryKey: ['review-template', caseId],
          }),
          queryClient.invalidateQueries({
            queryKey: ['aggregated-case', caseId],
          }),
        ]);
        await onSuccess?.();
      },
      onError: (error: Error) => {
        toast.error(
          error.message ||
            'Fehler beim Beantragen der Korrektur. Bitte versuche es erneut.',
        );
      },
    },
  );

  const handleDisputeSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!userId) {
      toast.error('Du musst angemeldet sein, um eine Korrektur zu beantragen');
      return;
    }

    if (!disputingField || !disputeReason.trim()) return;

    const currentValue = String(disputingField.answer_value || '');

    createDispute({
      caseId,
      fieldId: disputingField.id,
      originalValue: currentValue,
      reason: disputeReason,
    });
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) {
          setDisputeReason('');
        }
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleDisputeSubmit}>
          <DialogHeader>
            <DialogTitle>Korrektur beantragen</DialogTitle>
            <DialogDescription>
              Bitte gib den Grund für die Korrektur an. Unser Team wird die
              Bewertung überprüfen.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-3">
              <Label htmlFor="dispute-reason">Grund der Korrektur</Label>
              <Textarea
                id="dispute-reason"
                placeholder="Beschreibe, warum diese Bewertung korrigiert werden sollte..."
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
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
              disabled={!disputeReason.trim() || isDisputeSubmitting}
            >
              {isDisputeSubmitting
                ? 'Wird gesendet...'
                : 'Korrektur beantragen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewDisputeDialog;
