import SafeRichText from '@/components/safe-rich-text';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatChallengeMessageDateRange } from '@/lib/challenge-message';
import type { ChallengeMessageData } from '@/lib/schemas';

interface ChallengeMessageCardProps {
  message: ChallengeMessageData;
}

export function ChallengeMessageCard({
  message,
}: ChallengeMessageCardProps) {
  return (
    <Card className="mt-4 rounded-lg border-brand-darkblue/20 bg-neutral-0/90 text-brand-darkblue shadow-sm">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-body-sm font-black uppercase tracking-normal text-brand-darkblue/65">
          {formatChallengeMessageDateRange(message)}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <SafeRichText
          value={message.contentHtml}
          className="text-body-md font-medium text-brand-darkblue [&_a]:text-brand-darkblue [&_p]:m-0 [&_strong]:font-black"
        />
      </CardContent>
    </Card>
  );
}
