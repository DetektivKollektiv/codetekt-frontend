import { expect, test } from '@playwright/test';
import { createCase, createMarker } from './support/flows';
import { cleanupCase, getCaseByContent, getE2EUserId } from './support/supabase';

test('creates a case from a URL', async ({ page }) => {
  const marker = createMarker('create-case');
  let caseId: string | null = null;

  try {
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
  }
});
