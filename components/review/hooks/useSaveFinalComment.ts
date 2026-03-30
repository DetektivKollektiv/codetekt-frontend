import { createCommentMutation } from '@/lib/queries/createComment';
import { Database } from '@/lib/types/database.types';
import { SupabaseClient } from '@supabase/supabase-js';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface UseSaveFinalCommentOptions {
  supabase: SupabaseClient<Database>;
  caseId: string;
  userId?: string;
}

export const useSaveFinalComment = ({
  supabase,
  caseId,
  userId,
}: UseSaveFinalCommentOptions) => {
  const queryClient = useQueryClient();

  const { mutateAsync: saveFinalCommentAsync, isPending: isSavingFinalComment } =
    useMutation({
      ...createCommentMutation(supabase),
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ['case', caseId],
        });
        toast.success('Kommentar gespeichert');
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Fehler beim Speichern des Kommentars');
      },
    });

  const saveFinalComment = async (
    comment: string,
    isFinalStepEnabled: boolean,
  ): Promise<boolean> => {
    const trimmedComment = comment.trim();

    if (!isFinalStepEnabled || trimmedComment.length === 0) {
      return false;
    }

    if (!userId) {
      toast.error('Du musst angemeldet sein, um zu kommentieren');
      return false;
    }

    try {
      await saveFinalCommentAsync({
        case_id: caseId,
        author_id: userId,
        content: trimmedComment,
      });
      return true;
    } catch {
      return false;
    }
  };

  return {
    saveFinalComment,
    isSavingFinalComment,
  };
};
