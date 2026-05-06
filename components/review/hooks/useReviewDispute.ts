import { Field } from '@/lib/schemas';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

interface UseReviewDisputeOptions {
  caseId: string;
  userId?: string;
}

export const useReviewDispute = ({
  caseId,
  userId,
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
    await queryClient.cancelQueries({ queryKey: ['review-template', caseId] });
    queryClient.removeQueries({ queryKey: ['review-template', caseId] });
    queryClient.removeQueries({ queryKey: ['case', caseId] });
    queryClient.removeQueries({ queryKey: ['aggregated-case', caseId] });
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
