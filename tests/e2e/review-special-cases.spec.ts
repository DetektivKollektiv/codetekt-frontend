import { test, type Page } from '@playwright/test';
import {
  createCase,
  createMarker,
  reviewFactchecked,
  reviewSatire,
} from './support/flows';
import { cleanupCase, waitForSubmittedReview } from './support/supabase';

const reviewNewCase = async (
  page: Page,
  markerPrefix: string,
  review: (page: Page, caseId: string) => Promise<void>,
) => {
  const createdCase = await createCase(page, createMarker(markerPrefix));

  try {
    await review(page, createdCase.caseId);
    await waitForSubmittedReview(createdCase.caseId);
  } finally {
    await cleanupCase(createdCase.caseId);
  }
};

test('submits a satire review', async ({ page }) => {
  await reviewNewCase(page, 'satire-review', reviewSatire);
});

test('submits a factchecked review', async ({ page }) => {
  await reviewNewCase(page, 'factchecked-review', reviewFactchecked);
});
