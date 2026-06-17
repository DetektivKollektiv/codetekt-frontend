'use client';

import { ImageIcon, LinkIcon } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

import { Button } from './button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { ShareImagePreview } from './share-image-preview';

interface SharePopUpProps {
  caseId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLinkShare: () => Promise<void>;
}

const getShareUrl = (caseId: string) =>
  `${window.location.origin}/archive/${caseId}`;

export function SharePopUp({
  caseId,
  open,
  onOpenChange,
  onLinkShare,
}: SharePopUpProps) {
  const [isImageSharing, setIsImageSharing] = React.useState(false);

  const handleImageShare = async () => {
    setIsImageSharing(true);

    try {
      const response = await fetch(`/api/cases/${caseId}/share-image`);

      if (!response.ok) {
        throw new Error('Share-Bild konnte nicht geladen werden.');
      }

      const blob = await response.blob();
      const fileName = `codetekt-fall-${caseId}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });
      const shareUrl = getShareUrl(caseId);
      const shareDataWithText: ShareData = {
        title: 'codetekt Fall',
        text: `Schau dir diesen codetekt Fall an: ${shareUrl}`,
        files: [file],
      };
      const shareDataFileOnly: ShareData = {
        title: 'codetekt Fall',
        files: [file],
      };
      const canShareWithText = navigator.canShare?.(shareDataWithText) ?? false;
      const canShareFileOnly = navigator.canShare?.(shareDataFileOnly) ?? false;

      if (canShareWithText) {
        await navigator.share(shareDataWithText);
        onOpenChange(false);
        return;
      }

      if (canShareFileOnly) {
        await navigator.share(shareDataFileOnly);
        onOpenChange(false);
        return;
      }

      toast.error(
        window.isSecureContext
          ? 'Dein Browser unterstützt das Teilen von Bildern hier nicht.'
          : 'Bild teilen braucht HTTPS. Bitte teste über eine HTTPS-URL.',
      );
    } catch (err) {
      if (!(err instanceof Error && err.name === 'AbortError')) {
        toast.error('Fehler beim Teilen des Share-Bildes.');
      }
    } finally {
      setIsImageSharing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto p-5 sm:max-w-md sm:p-6">
        <DialogHeader className="pr-8 text-left">
          <DialogTitle className="text-display-sm">Fall teilen</DialogTitle>
          <DialogDescription className="sr-only">
            Teile den Fall als Link oder als generiertes Share-Bild.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-8">
          <section className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <h3 className="text-heading-lg">
                Auf WhatsApp oder Telegram teilen
              </h3>
              <p className="text-body-md text-muted-foreground">
                Teile den Link zum Fall
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full text-heading-sm"
              onClick={onLinkShare}
            >
              <LinkIcon data-icon="inline-start" />
              Link teilen
            </Button>
          </section>

          <section className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h3 className="text-heading-lg">
                Auf Instagram oder TikTok teilen
              </h3>
            </div>
            <ShareImagePreview caseId={caseId} />
            <p className="text-body-md text-muted-foreground">
              Teile ein Bild des Falles in einer Story, Reel oder Beitrag
            </p>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full text-heading-sm"
              onClick={handleImageShare}
              disabled={isImageSharing}
            >
              <ImageIcon data-icon="inline-start" />
              {isImageSharing ? 'Bild wird vorbereitet...' : 'Bild teilen'}
            </Button>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
