import { toast } from 'sonner';
import { AggregatedReviews } from '../queries/getAggregatedReviews';
import { OpenGraphData } from '../schemas';

export const handleShare = async (
  caseItem: AggregatedReviews[number],
  ogData: OpenGraphData | null,
) => {
  // Only use ogDescription for text field, not the content URL
  const shareData: ShareData = {
    title: `Fall ${caseItem.cases.case_number}`,
    url: `${window.location.origin}/archive/${caseItem.case_id}`,
    ...(ogData?.ogDescription && { text: ogData.ogDescription }),
  };

  // Check if Web Share API is available
  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch (err) {
      // User cancelled or error occurred
      if (err instanceof Error && err.name !== 'AbortError') {
        toast.error('Fehler beim Teilen des Falls.');
        fallbackShare(shareData.url!);
      }
    }
  } else {
    // Fallback for browsers that don't support Web Share API
    fallbackShare(shareData.url!);
  }
};

const fallbackShare = (url: string) => {
  // Copy to clipboard as fallback
  navigator.clipboard.writeText(url).then(
    () => {
      // Show toast notification
      toast.success('Link zum Fall wurde in die Zwischenablage kopiert!');
    },
    (err) => {
      toast.error('Fehler beim Kopieren des Links in die Zwischenablage.');
    },
  );
};
