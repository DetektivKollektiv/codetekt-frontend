import { TutorialPageContent } from '@/components/tutorial';
import { getChallengeProgress } from '@/lib/queries/getChallengeProgress';
import { getTutorialContent } from '@/lib/queries/getTutorialContent';
import { getAuth } from '@/lib/supabase/getAuth';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export default async function TutorialPage() {
  const client = await createClient();
  const [tutorialContentResult, auth, challengeProgressResult] =
    await Promise.all([
      getTutorialContent(client),
      getAuth(client),
      getChallengeProgress(client),
    ]);

  if (tutorialContentResult.error) {
    throw tutorialContentResult.error;
  }

  if (challengeProgressResult.error) {
    throw challengeProgressResult.error;
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
      challengeProgress={challengeProgressResult.data}
      requiresConfirmation={requiresConfirmation}
      tutorialContent={tutorialContentResult.data}
    />
  );
}
