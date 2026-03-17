import { Field } from '@/lib/schemas';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

interface UseReviewDisputeOptions {
  caseId: string;
  userId?: string;
  markAsSaved: () => void;
}

export const useReviewDispute = ({
  caseId,
  userId,
  markAsSaved,
}: UseReviewDisputeOptions) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isDisputeDialogOpen, setIsDisputeDialogOpen] = useState(false);
  const [disputingField, setDisputingField] = useState<Field | null>(null);

  const openDisputeDialog = (field: Field) => {
    if (!userId) {
      toast.error('Du musst angemeldet sein, um eine Korrektur zu beantragen');
      return;
    }
    setDisputingField(field);
    setIsDisputeDialogOpen(true);
  };

  const handleDisputeSuccess = async () => {
    setDisputingField(null);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['case', caseId] }),
      queryClient.invalidateQueries({
        queryKey: ['review-template', caseId],
      }),
    ]);
    markAsSaved();
    router.push('/');
  };

  return {
    isDisputeDialogOpen,
    setIsDisputeDialogOpen,
    disputingField,
    openDisputeDialog,
    handleDisputeSuccess,
  };
};
