'use client';
import { createReviewDisputeMutation } from '@/lib/queries/createReviewDispute';
import { Case } from '@/lib/queries/getCase';
import { ReviewTemplate } from '@/lib/queries/getReviewTemplate';
import { saveReviewAnswersInProgressMutation } from '@/lib/queries/saveReviewAnswersInProgress';
import { submitReviewAnswersMutation } from '@/lib/queries/submitReviewAnswers';
import { Field } from '@/lib/schemas';
import { createClient } from '@/lib/supabase/client';
import { resolveReviewTemplateConditions } from '@/lib/utils/condition-evaluator';
import { getPreviewRatingStyle } from '@/lib/utils/rating-helpers';
import {
  buildInProgressReviewAnswerData,
  getQuestionsValidationState,
  validateInProgressReviewAnswer,
  validateSubmittedReviewAnswer,
} from '@/lib/utils/review-validation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit, Loader2, SaveAll } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
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
import { HelpButton } from '../ui/help-button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import CaseCard from './case-card';
import { useReviewState } from './hooks/useReviewState';
import { useUnsavedChangesWarning } from './hooks/useUnsavedChangesWarning';
import QuestionCard from './question-card';
import ReviewNavigation from './review-navigation';
import SuccesCard from './success-card';
import { RenderFieldsWithHeaders } from './utils/render-fields';

interface ReviewContentProps {
  reviewTemplate: NonNullable<ReviewTemplate>;
  caseData: NonNullable<Case>;
  isSubmitted: boolean;
  userId?: string;
}

const ReviewContent: FC<ReviewContentProps> = ({
  reviewTemplate,
  caseData,
  isSubmitted: initialIsSubmitted,
  userId,
}) => {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isSubmitted, setIsSubmitted] = useState(initialIsSubmitted);
  const [isEditable, setIsEditable] = useState(!initialIsSubmitted);
  const [isDisputeSubmitting, setIsDisputeSubmitting] = useState(false);
  const [isDisputeDialogOpen, setIsDisputeDialogOpen] = useState(false);
  const [disputingField, setDisputingField] = useState<Field | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [touchedQuestionIds, setTouchedFieldIds] = useState<Set<string>>(
    new Set(),
  );

  // Review state management
  const { reviewTemplateWithAnswersValues, updateFieldValue } =
    useReviewState(reviewTemplate);

  const [currentQuestionId, setCurrentQuestionId] = useState(
    isSubmitted
      ? reviewTemplate[reviewTemplate.length - 1].id
      : reviewTemplate[0].id,
  );

  // Resolve all conditions to booleans
  const resolvedReviewTemplate = useMemo(
    () => resolveReviewTemplateConditions(reviewTemplateWithAnswersValues),
    [reviewTemplateWithAnswersValues],
  );

  // Automatically build InProgressReviewAnswer object whenever answers change
  const inProgressReviewAnswerData = useMemo(() => {
    const data = buildInProgressReviewAnswerData(
      reviewTemplateWithAnswersValues,
    );
    return data;
  }, [reviewTemplateWithAnswersValues]);

  // Check if data is valid for final submission
  const isValidForSubmission = useMemo(() => {
    const validationResult = validateSubmittedReviewAnswer(
      inProgressReviewAnswerData,
    );
    return validationResult.success;
  }, [inProgressReviewAnswerData]);

  // Unsaved changes warning
  const {
    hasUnsavedChanges,
    markAsSaved,
    setIsActive: setUnsavedChangesWarningActive,
  } = useUnsavedChangesWarning({
    data: inProgressReviewAnswerData,
  });

  useEffect(() => {
    setUnsavedChangesWarningActive(isEditable);
  }, [isEditable, setUnsavedChangesWarningActive]);

  // Filter out questions where all fields are not shown
  const shownReviewTemplateQuestions = useMemo(
    () =>
      resolvedReviewTemplate.filter((question) =>
        question.fields.some(
          (field) => field.is_shown === true || field.is_shown === undefined,
        ),
      ),
    [resolvedReviewTemplate],
  );

  const isLastQuestion = useMemo(() => {
    const currentIndex = shownReviewTemplateQuestions.findIndex(
      (q) => q.id === currentQuestionId,
    );
    return currentIndex === shownReviewTemplateQuestions.length - 1;
  }, [currentQuestionId, shownReviewTemplateQuestions]);

  const currentQuestion = useMemo(
    () =>
      shownReviewTemplateQuestions.find(
        (item) => item.id === currentQuestionId,
      ) || shownReviewTemplateQuestions[0],
    [currentQuestionId, shownReviewTemplateQuestions],
  );

  const previousQuestionRef = useRef(currentQuestion);

  useEffect(() => {
    const previousId = previousQuestionRef.current?.id;
    if (previousId && previousId !== currentQuestion.id) {
      setTouchedFieldIds((prev) => new Set([...prev, previousId]));
    }
    previousQuestionRef.current = currentQuestion;
  }, [currentQuestion]);

  // Get validation state for all questions
  const questionsValidationState = useMemo(() => {
    return getQuestionsValidationState(
      resolvedReviewTemplate,
      inProgressReviewAnswerData,
    );
  }, [resolvedReviewTemplate, inProgressReviewAnswerData]);

  const setNextQuestion = () => {
    const currentIndex = shownReviewTemplateQuestions.findIndex(
      (q) => q.id === currentQuestionId,
    );
    if (currentIndex < shownReviewTemplateQuestions.length - 1) {
      const nextQuestionId = shownReviewTemplateQuestions[currentIndex + 1].id;
      setCurrentQuestionId(nextQuestionId);
    }
  };

  // Handler to save in-progress review
  const { mutate: saveInProgress, isPending: isSavingPending } = useMutation({
    ...saveReviewAnswersInProgressMutation(supabase),
    onSuccess: () => {
      toast.success('Entwurf gespeichert');
      markAsSaved();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Fehler beim Speichern');
      console.error('✗ Save failed:', error);
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
      case_id: caseData.id,
      data: validationResult.data,
    });
  };

  // Handler to submit review (final submission)
  const { mutate: submitReview, isPending: isSubmitting } = useMutation({
    ...submitReviewAnswersMutation(supabase),
    onSuccess: async () => {
      toast.success('Fall erfolgreich abgeschlossen');
      setIsSubmitted(true);
      setIsEditable(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['case', caseData?.id] }),
        queryClient.invalidateQueries({
          queryKey: ['review-template', caseData?.id],
        }),
      ]);
      markAsSaved();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Fehler beim Abschließen des Falls');
      console.error('✗ Submit failed:', error);
    },
  });

  const handleSubmitReview = async () => {
    if (!userId) {
      toast.error('Du musst angemeldet sein, um einen Fall abzuschließen');
      return;
    }

    const validationResult = validateSubmittedReviewAnswer(
      inProgressReviewAnswerData,
    );

    if (!validationResult.success) {
      console.error('✗ Validation failed:', validationResult.error);
      toast.error('Bitte fülle alle erforderlichen Felder aus');
      return;
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
        case_id: caseData.id,
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

  // Mutation for creating review dispute
  const { mutate: createDispute } = useMutation({
    ...createReviewDisputeMutation(supabase, userId || ''),
    onMutate: () => {
      setIsDisputeSubmitting(true);
    },
    onSuccess: async () => {
      toast.success(
        'Korrektur erfolgreich beantragt. Unser Team wird die Bewertung überprüfen.',
      );
      setIsDisputeSubmitting(false);
      setIsDisputeDialogOpen(false);
      setDisputeReason('');
      setDisputingField(null);

      queryClient.invalidateQueries({ queryKey: ['case', caseData?.id] });
      queryClient.invalidateQueries({
        queryKey: ['review-template', caseData?.id],
      });
      markAsSaved();
      router.push('/');
    },
    onError: (error: Error) => {
      toast.error(
        error.message ||
          'Fehler beim Beantragen der Korrektur. Bitte versuche es erneut.',
      );
      setIsDisputeSubmitting(false);
    },
  });

  const openDisputeDialog = (field: Field) => {
    if (!userId) {
      toast.error('Du musst angemeldet sein, um eine Korrektur zu beantragen');
      return;
    }
    setDisputingField(field);
    setIsDisputeDialogOpen(true);
  };

  const handleDisputeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputingField || !disputeReason.trim()) return;

    const currentValue = String(disputingField.answer_value || '');

    createDispute({
      caseId: caseData.id,
      fieldId: disputingField.id,
      originalValue: currentValue,
      reason: disputeReason,
    });
  };

  return (
    <>
      <Dialog open={isDisputeDialogOpen} onOpenChange={setIsDisputeDialogOpen}>
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

      <div
        className="page-max-w lg:grid lg:gap-6"
        style={{
          gridTemplateColumns: '300px 1fr ',
        }}
      >
        <div>
          <CaseCard
            case={caseData}
            ratingStyle={getPreviewRatingStyle(reviewTemplateWithAnswersValues)}
          />
          <div className="my-4 lg:my-0 lg:mt-4">
            <ReviewNavigation
              touchedQuestionsIds={Array.from(touchedQuestionIds)}
              reviewTemplateQuestions={shownReviewTemplateQuestions}
              onItemClick={setCurrentQuestionId}
              questionsValidationState={questionsValidationState}
              currentQuestion={currentQuestion}
              disabled={!isEditable}
            />
          </div>
        </div>
        {isSubmitted && !isEditable ? (
          <SuccesCard>
            <Button
              variant={'outline'}
              size={'default'}
              className="w-full"
              onClick={() => {
                setIsEditable(true);
                setCurrentQuestionId(shownReviewTemplateQuestions[0].id);
              }}
            >
              <Edit className="w-4 h-4 mr-2" />
              Fall bearbeiten
            </Button>
            <Link href={`/#open-cases`} className="w-full mt-2">
              <Button variant={'default'} size={'default'} className="w-full">
                Weitere Fälle bearbeiten
              </Button>
            </Link>
          </SuccesCard>
        ) : (
          <QuestionCard
            question={currentQuestion}
            headerActions={
              <>
                <HelpButton />
                <Button
                  variant={hasUnsavedChanges ? 'destructive' : 'outline'}
                  size={'default'}
                  onClick={handleSaveInProgress}
                  disabled={!hasUnsavedChanges || isSavingPending}
                >
                  {isSavingPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <SaveAll className="w-4 h-4 mr-2" />
                  )}
                  Speichern
                </Button>
              </>
            }
            footer={
              <div className="flex flex-col w-full gap-2">
                {isLastQuestion ? (
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={handleSubmitReview}
                    disabled={!isValidForSubmission || isSubmitting}
                  >
                    {isSubmitting
                      ? 'Wird abgeschlossen...'
                      : 'Fall abschließen'}
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={setNextQuestion}
                  >
                    Nächste Frage
                  </Button>
                )}
              </div>
            }
          >
            <RenderFieldsWithHeaders
              currentQuestion={currentQuestion}
              questionsValidationState={questionsValidationState}
              onFieldChange={updateFieldValue}
              onCreateReviewDispute={openDisputeDialog}
              touchedQuestions={Array.from(touchedQuestionIds)}
            />
          </QuestionCard>
        )}
      </div>
    </>
  );
};

export default ReviewContent;
