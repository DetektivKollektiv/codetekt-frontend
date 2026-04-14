import {
  saveReviewAnswersInProgressMutation,
} from '@/lib/queries/saveReviewAnswersInProgress';
import type { SaveReviewAnswersInProgressData } from '@/lib/queries/saveReviewAnswersInProgress';
import {
  submitReviewAnswersMutation,
} from '@/lib/queries/submitReviewAnswers';
import type { SubmitReviewAnswersData } from '@/lib/queries/submitReviewAnswers';
import type { CaseCategoryValue } from '@/lib/schemas/case-metadata-schemas';
import type { InProgressReviewAnswer } from '@/lib/schemas/review-schemas';
import type { Database } from '@/lib/types/database.types';
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
}

interface SubmitReviewOptions {
  userId?: string;
  caseCategory?: CaseCategoryValue | null;
  hasFactcheck: boolean;
  inProgressReviewAnswerData: InProgressReviewAnswer;
}

interface ReviewSubmissionMutations {
  saveInProgressAsync: (
    data: SaveReviewAnswersInProgressData,
  ) => Promise<{ in_progress_id?: string } | null>;
  submitReviewAsync: (data: SubmitReviewAnswersData) => Promise<unknown>;
}

const validateSaveInProgress = (data: InProgressReviewAnswer) => {
  const validationResult = validateInProgressReviewAnswer(data);
  if (validationResult.success) return validationResult.data;

  console.error('✗ Validation failed:', validationResult.error);
  toast.error('Validierungsfehler beim Speichern');
  return null;
};

const validateSubmit = ({
  userId,
  caseCategory,
  hasFactcheck,
  inProgressReviewAnswerData,
}: SubmitReviewOptions) => {
  if (!userId) {
    toast.error('Du musst angemeldet sein, um einen Fall abzuschließen');
    return null;
  }

  if (!hasFactcheck && !caseCategory) {
    toast.error('Bitte wähle zuerst eine Kategorie aus');
    return null;
  }

  if (!hasFactcheck) {
    const submitted = validateSubmittedReviewAnswer(
      inProgressReviewAnswerData,
      caseCategory,
    );
    if (!submitted.success) {
      console.error('✗ Validation failed:', submitted.error);
      toast.error('Bitte fülle alle erforderlichen Felder aus');
      return null;
    }
  }

  const inProgress = validateInProgressReviewAnswer(inProgressReviewAnswerData);
  if (inProgress.success) return inProgress.data;

  console.error('✗ In-progress validation failed:', inProgress.error);
  toast.error('Validierungsfehler');
  return null;
};

const createReviewSubmissionHandlers = ({
  caseId,
  mutations,
}: {
  caseId: string;
  mutations: ReviewSubmissionMutations;
}) => ({
  saveInProgress: async ({
    data,
    userId,
  }: {
    data: InProgressReviewAnswer;
    userId?: string;
  }): Promise<boolean> => {
    const validData = validateSaveInProgress(data);
    if (!validData) return false;

    if (!userId) {
      toast.error('Du musst angemeldet sein, um zu speichern');
      return false;
    }

    try {
      await mutations.saveInProgressAsync({ case_id: caseId, data: validData });
      return true;
    } catch {
      return false;
    }
  },
  submitReview: async (options: SubmitReviewOptions): Promise<boolean> => {
    const validData = validateSubmit(options);
    if (!validData) return false;

    try {
      const saveResult = await mutations.saveInProgressAsync({
        case_id: caseId,
        data: validData,
      });
      if (!saveResult?.in_progress_id) return false;
      await mutations.submitReviewAsync({
        in_progress_id: saveResult.in_progress_id,
      });
      return true;
    } catch {
      return false;
    }
  },
});

export const useReviewSubmission = ({
  supabase,
  caseId,
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

  const handlers = createReviewSubmissionHandlers({
    caseId,
    mutations: {
      saveInProgressAsync,
      submitReviewAsync,
    },
  });

  return {
    ...handlers,
    isSavingPending,
    isSubmitting,
  };
};
