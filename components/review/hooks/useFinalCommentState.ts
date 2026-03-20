import { Case } from '@/lib/queries/getCase';
import { useMemo, useState } from 'react';

interface UseFinalCommentStateOptions {
  caseData: NonNullable<Case>;
  userId?: string;
  isFinalStepEnabled: boolean;
}

export const useFinalCommentState = ({
  caseData,
  userId,
  isFinalStepEnabled,
}: UseFinalCommentStateOptions) => {
  const [finalComment, setFinalComment] = useState('');

  const latestUserComment = useMemo(() => {
    if (!userId) {
      return null;
    }

    const userComments =
      caseData.case_comments?.filter(
        (comment) => comment.author_id === userId,
      ) ?? [];

    if (userComments.length === 0) {
      return null;
    }

    return userComments.reduce((latestComment, currentComment) => {
      const latestTimestamp = latestComment.created_at
        ? new Date(latestComment.created_at).getTime()
        : 0;
      const currentTimestamp = currentComment.created_at
        ? new Date(currentComment.created_at).getTime()
        : 0;

      return currentTimestamp > latestTimestamp
        ? currentComment
        : latestComment;
    });
  }, [caseData.case_comments, userId]);

  const hasUserComment = !!latestUserComment;
  const displayedFinalComment = latestUserComment?.content ?? finalComment;
  const isFinalCommentInputDisabled = !isFinalStepEnabled || hasUserComment;

  return {
    finalComment,
    setFinalComment,
    hasUserComment,
    displayedFinalComment,
    isFinalCommentInputDisabled,
  };
};
