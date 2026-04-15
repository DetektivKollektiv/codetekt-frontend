import { expect, test } from '@playwright/test';
import { createCase, createMarker, reviewReport } from './support/flows';
import { cleanupCase, waitForSubmittedReview } from './support/supabase';

test.describe('report review flow', () => {
  let caseId: string | null = null;

  test.beforeEach(async ({ page }) => {
    const createdCase = await createCase(page, createMarker('review-report'));
    caseId = createdCase.caseId;
  });

  test.afterEach(async () => {
    if (caseId) {
      await cleanupCase(caseId);
      caseId = null;
    }
  });

  test('submits a report review', async ({ page }) => {
    expect(caseId).not.toBeNull();

    await reviewReport(page, caseId!);
    await waitForSubmittedReview(caseId!);
  });
});
