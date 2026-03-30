import { saveReviewAnswersInProgressMutation } from '@/lib/queries/saveReviewAnswersInProgress';
import { submitReviewAnswersMutation } from '@/lib/queries/submitReviewAnswers';
import { CaseCategoryValue } from '@/lib/schemas/case-metadata-schemas';
import { InProgressReviewAnswer } from '@/lib/schemas/review-schemas';
import { Database } from '@/lib/types/database.types';
import {
  validateInProgressReviewAnswer,
  validateSubmittedReviewAnswer,
} from '@/lib/utils/review-validation';
import { SupabaseClient } from '@supabase/supabase-js';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface UseReviewSubmissionOptions {
  supabase: SupabaseClient<Database>;
  caseId: string;
  onSubmitSuccess: () => void;
}

export const useReviewSubmission = ({
  supabase,
  caseId,
  onSubmitSuccess,
}: UseReviewSubmissionOptions) => {
  const queryClient = useQueryClient();

  const { mutateAsync: saveInProgressAsync, isPending: isSavingPending } =
    useMutation({
      ...saveReviewAnswersInProgressMutation(supabase),
      onSuccess: () => {
        toast.success('Zwischenstand gespeichert');
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Fehler beim Speichern');
        console.error('✗ Save failed:', error);
      },
    });

  const { mutateAsync: submitReviewAsync, isPending: isSubmitting } =
    useMutation({
    ...submitReviewAnswersMutation(supabase),
    onSuccess: async () => {
      toast.success('Fall erfolgreich abgeschlossen');
      onSubmitSuccess();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['case', caseId] }),
        queryClient.invalidateQueries({ queryKey: ['aggregated-cases'] }),
        queryClient.invalidateQueries({ queryKey: ['user-cases'] }),
        queryClient.invalidateQueries({ queryKey: ['user-reviews'] }),
        queryClient.invalidateQueries({ queryKey: ['open-cases'] }),
        queryClient.invalidateQueries({
          queryKey: ['review-template', caseId],
        }),
        queryClient.invalidateQueries({
          queryKey: ['aggregated-case', caseId],
        }),
      ]);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Fehler beim Abschließen des Falls');
      console.error('✗ Submit failed:', error);
    },
  });

  const saveInProgress = async ({
    data,
    userId,
  }: {
    data: InProgressReviewAnswer;
    userId?: string;
  }): Promise<boolean> => {
    const validationResult = validateInProgressReviewAnswer(
      data,
    );

    if (!validationResult.success) {
      console.error('✗ Validation failed:', validationResult.error);
      toast.error('Validierungsfehler beim Speichern');
      return false;
    }

    if (!userId) {
      toast.error('Du musst angemeldet sein, um zu speichern');
      return false;
    }

    try {
      await saveInProgressAsync({
        case_id: caseId,
        data: validationResult.data,
      });
      return true;
    } catch {
      return false;
    }
  };

  const submitReview = async ({
    userId,
    caseCategory,
    hasFactcheck,
    inProgressReviewAnswerData,
  }: {
    userId?: string;
    caseCategory?: CaseCategoryValue | null;
    hasFactcheck: boolean;
    inProgressReviewAnswerData: InProgressReviewAnswer;
  }): Promise<boolean> => {
    if (!userId) {
      toast.error('Du musst angemeldet sein, um einen Fall abzuschließen');
      return false;
    }

    if (!hasFactcheck && !caseCategory) {
      toast.error('Bitte wähle zuerst eine Kategorie aus');
      return false;
    }

    if (!hasFactcheck) {
      const validationResult = validateSubmittedReviewAnswer(
        inProgressReviewAnswerData,
        caseCategory,
      );

      if (!validationResult.success) {
        console.error('✗ Validation failed:', validationResult.error);
        toast.error('Bitte fülle alle erforderlichen Felder aus');
        return false;
      }
    }

    const inProgressValidation = validateInProgressReviewAnswer(
      inProgressReviewAnswerData,
    );

    if (!inProgressValidation.success) {
      console.error(
        '✗ In-progress validation failed:',
        inProgressValidation.error,
      );
      toast.error('Validierungsfehler');
      return false;
    }

    try {
      const saveResult = await saveInProgressAsync({
        case_id: caseId,
        data: inProgressValidation.data,
      });

      if (!saveResult?.in_progress_id) {
        return false;
      }

      await submitReviewAsync({
        in_progress_id: saveResult.in_progress_id,
      });

      return true;
    } catch {
      return false;
    }
  };

  return {
    saveInProgress,
    submitReview,
    isSavingPending,
    isSubmitting,
  };
};
