import { expect, test } from '@playwright/test';
import {
  completeRequiredTutorial,
  createCase,
  createMarker,
  expectRequiredTutorialNotToAppear,
} from './support/flows';
import {
  cleanupCase,
  getCaseByContent,
  getE2EUserId,
  getProfileTutorialCompletedAt,
  setProfileTutorialCompletedAt,
} from './support/supabase';

test('creates a case from a URL after confirming the tutorial once', async ({
  page,
}) => {
  const marker = createMarker('create-case');
  let caseId: string | null = null;
  const previousTutorialCompletedAt = await getProfileTutorialCompletedAt();

  await setProfileTutorialCompletedAt(null);

  try {
    await page.goto('/submit');
    await completeRequiredTutorial(page);
    await expect.poll(() => getProfileTutorialCompletedAt()).not.toBeNull();

    await page.goto('/submit');
    await expectRequiredTutorialNotToAppear(page);

    const createdCase = await createCase(page, marker);
    caseId = createdCase.caseId;

    const [caseRecord, userId] = await Promise.all([
      getCaseByContent(createdCase.content),
      getE2EUserId(),
    ]);

    expect(caseRecord).not.toBeNull();
    expect(caseRecord?.content).toBe(createdCase.content);
    expect(caseRecord?.submitted_by).toBe(userId);
  } finally {
    if (caseId) {
      await cleanupCase(caseId);
    }

    const currentTutorialCompletedAt = await getProfileTutorialCompletedAt();

    if (previousTutorialCompletedAt) {
      await setProfileTutorialCompletedAt(previousTutorialCompletedAt);
    } else if (!currentTutorialCompletedAt) {
      await setProfileTutorialCompletedAt(new Date().toISOString());
    }
  }
});
