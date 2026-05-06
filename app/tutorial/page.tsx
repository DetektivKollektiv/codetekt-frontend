import { TutorialPageContent } from '@/components/tutorial';
import { getTutorialContent } from '@/lib/queries/getTutorialContent';
import { getAuth } from '@/lib/supabase/getAuth';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export default async function TutorialPage() {
  const client = await createClient();
  const [tutorialContentResult, auth] = await Promise.all([
    getTutorialContent(client),
    getAuth(client),
  ]);

  if (tutorialContentResult.error) {
    throw tutorialContentResult.error;
  }

  if (!tutorialContentResult.data) {
    notFound();
  }

  const requiresConfirmation = Boolean(
    auth.isAuthenticated &&
      auth.user &&
      auth.profile &&
      auth.profile.tutorial_completed_at === null,
  );

  return (
    <TutorialPageContent
      requiresConfirmation={requiresConfirmation}
      tutorialContent={tutorialContentResult.data}
    />
  );
}
