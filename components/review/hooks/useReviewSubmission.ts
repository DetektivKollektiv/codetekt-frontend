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
  userId?: string;
  caseCategory?: CaseCategoryValue | null;
  hasFactcheck?: boolean;
  inProgressReviewAnswerData: InProgressReviewAnswer;
  markAsSaved: () => void;
  onSubmitSuccess: () => void;
}

export const useReviewSubmission = ({
  supabase,
  caseId,
  userId,
  caseCategory,
  hasFactcheck = false,
  inProgressReviewAnswerData,
  markAsSaved,
  onSubmitSuccess,
}: UseReviewSubmissionOptions) => {
  const queryClient = useQueryClient();

  const { mutate: saveInProgress, isPending: isSavingPending } = useMutation({
    ...saveReviewAnswersInProgressMutation(supabase),
    onSuccess: () => {
      toast.success('Zwischenstand gespeichert');
      markAsSaved();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Fehler beim Speichern');
      console.error('✗ Save failed:', error);
    },
  });

  const { mutate: submitReview, isPending: isSubmitting } = useMutation({
    ...submitReviewAnswersMutation(supabase),
    onSuccess: async () => {
      toast.success('Fall erfolgreich abgeschlossen');
      onSubmitSuccess();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['case', caseId] }),
        queryClient.invalidateQueries({
          queryKey: ['review-template', caseId],
        }),
        queryClient.invalidateQueries({
          queryKey: ['aggregated-case', caseId],
        }),
      ]);
      markAsSaved();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Fehler beim Abschließen des Falls');
      console.error('✗ Submit failed:', error);
    },
  });

  const handleSaveInProgress = () => {
    const validationResult = validateInProgressReviewAnswer(
      inProgressReviewAnswerData,
    );

    if (!validationResult.success) {
      console.error('✗ Validation failed:', validationResult.error);
      toast.error('Validierungsfehler beim Speichern');
      return;
    }

    if (!userId) {
      toast.error('Du musst angemeldet sein, um zu speichern');
      return;
    }

    saveInProgress({
      case_id: caseId,
      data: validationResult.data,
    });
  };

  const handleSubmitReview = () => {
    if (!userId) {
      toast.error('Du musst angemeldet sein, um einen Fall abzuschließen');
      return;
    }

    if (!hasFactcheck && !caseCategory) {
      toast.error('Bitte wähle zuerst eine Kategorie aus');
      return;
    }

    if (!hasFactcheck) {
      const validationResult = validateSubmittedReviewAnswer(
        inProgressReviewAnswerData,
        caseCategory,
      );

      if (!validationResult.success) {
        console.error('✗ Validation failed:', validationResult.error);
        toast.error('Bitte fülle alle erforderlichen Felder aus');
        return;
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
      return;
    }

    saveInProgress(
      {
        case_id: caseId,
        data: inProgressValidation.data,
      },
      {
        onSuccess: (saveResult) => {
          if (saveResult?.in_progress_id) {
            submitReview({
              in_progress_id: saveResult.in_progress_id,
            });
          }
        },
      },
    );
  };

  return {
    handleSaveInProgress,
    handleSubmitReview,
    isSavingPending,
    isSubmitting,
  };
};
