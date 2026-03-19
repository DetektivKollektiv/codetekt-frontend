import { createCommentMutation } from '@/lib/queries/createComment';
import { Database } from '@/lib/types/database.types';
import { SupabaseClient } from '@supabase/supabase-js';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

interface UseSaveFinalCommentOptions {
  supabase: SupabaseClient<Database>;
  caseId: string;
  userId?: string;
  isFinalStepEnabled: boolean;
  onSuccess?: () => void;
}

export const useSaveFinalComment = ({
  supabase,
  caseId,
  userId,
  isFinalStepEnabled,
  onSuccess,
}: UseSaveFinalCommentOptions) => {
  const { mutate: saveFinalComment, isPending: isSavingFinalComment } =
    useMutation({
      ...createCommentMutation(supabase),
      onSuccess: () => {
        toast.success('Kommentar gespeichert');
        onSuccess?.();
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Fehler beim Speichern des Kommentars');
      },
    });

  const handleSaveFinalComment = (comment: string) => {
    const trimmedComment = comment.trim();

    if (!isFinalStepEnabled || trimmedComment.length === 0) {
      return;
    }

    if (!userId) {
      toast.error('Du musst angemeldet sein, um zu kommentieren');
      return;
    }

    saveFinalComment({
      case_id: caseId,
      author_id: userId,
      content: trimmedComment,
    });
  };

  return {
    handleSaveFinalComment,
    isSavingFinalComment,
  };
};
