import { expect, test } from '@playwright/test';
import {
  createCase,
  createMarker,
  reviewExistingReport,
  reviewReport,
  signIn,
} from './support/flows';
import {
  cleanupCase,
  insertCaseCategory,
  waitForAggregatedReview,
  waitForSubmittedReview,
} from './support/supabase';
import {
  BASE_URL,
  E2E_SECOND_USER_EMAIL,
  E2E_SECOND_USER_PASSWORD,
} from './support/env';

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

  test('refreshes the case after a concurrent category save', async ({ page }) => {
    expect(caseId).not.toBeNull();

    await page.goto(`/review/${caseId}`);

    await page.getByLabel('Titel').fill(`E2E Race Review ${Date.now()}`);
    await page.getByRole('button', { name: 'Speichern' }).click();

    await page
      .getByLabel('Stichwort eingeben (max. 50 Zeichen)')
      .fill('Stichwort');
    await page.getByRole('button', { name: 'Hinzufügen' }).click();
    await page.getByRole('button', { name: 'Speichern' }).click();

    await page.getByRole('button', { name: 'Satire' }).click();
    await insertCaseCategory(caseId!, 'report');
    await page.getByRole('button', { name: 'Speichern' }).click();

    await expect(
      page.getByText(
        'In der Zwischenzeit hat ein anderer Nutzer den Fall weiter bearbeitet. Der aktuelle Stand wurde geladen.',
      ),
    ).toBeVisible();
    await expect(page.getByText(/duplicate key value/)).toHaveCount(0);
    await expect(page.getByText(/fallen unter die Kategorie/)).toBeVisible();

    await page.getByRole('button', { name: 'Die Kategorie passt' }).click();
    await expect(
      page.getByText('Hat der Fall bereits einen Faktencheck?'),
    ).toBeVisible();
  });

  test('refreshes the case after a concurrent factcheck save', async ({
    browser,
    page,
  }) => {
    expect(caseId).not.toBeNull();

    await page.goto(`/review/${caseId}`);
    await page.getByLabel('Titel').fill(`E2E Factcheck Race ${Date.now()}`);
    await page.getByRole('button', { name: 'Speichern' }).click();
    await page
      .getByLabel('Stichwort eingeben (max. 50 Zeichen)')
      .fill('Stichwort');
    await page.getByRole('button', { name: 'Hinzufügen' }).click();
    await page.getByRole('button', { name: 'Speichern' }).click();
    await page.getByRole('button', { name: 'Bericht' }).click();
    await page.getByRole('button', { name: 'Speichern' }).click();

    const secondUserContext = await browser.newContext({ baseURL: BASE_URL });
    const secondUserPage = await secondUserContext.newPage();

    try {
      await signIn(secondUserPage, {
        email: E2E_SECOND_USER_EMAIL,
        password: E2E_SECOND_USER_PASSWORD,
      });
      await secondUserPage.goto(`/review/${caseId}`);
      await secondUserPage.getByRole('button', { name: 'Der Titel passt' }).click();
      await secondUserPage
        .getByRole('button', { name: 'Die Stichwörter passen' })
        .click();
      await secondUserPage
        .getByRole('button', { name: 'Die Kategorie passt' })
        .click();
      await secondUserPage
        .getByRole('button', { name: /Nein\s+Es liegt kein Faktencheck vor\./ })
        .click();

      await page
        .getByRole('button', { name: /Ja\s+Es gibt bereits einen Faktencheck\./ })
        .click();
      const factcheckUrl = `https://example.com/codetekt-e2e-factcheck-race-${Date.now()}`;
      await page.getByLabel('URL zum Faktencheck').fill(factcheckUrl);
      await page.getByRole('button', { name: 'Speichern' }).click();

      await secondUserPage.getByRole('button', { name: 'Speichern' }).click();

      await expect(
        secondUserPage.getByText(
          'In der Zwischenzeit hat ein anderer Nutzer den Fall weiter bearbeitet. Der aktuelle Stand wurde geladen.',
        ),
      ).toBeVisible();
      await expect(
        secondUserPage.getByLabel('URL zum Faktencheck'),
      ).toHaveValue(factcheckUrl);
      await expect(
        secondUserPage.getByRole('button', { name: 'Einordnung passt' }),
      ).toBeVisible();
    } finally {
      await secondUserContext.close();
    }
  });

  test('lets a second user review a report and open it from the archive', async ({
    browser,
    page,
  }) => {
    expect(caseId).not.toBeNull();

    await reviewReport(page, caseId!);
    await waitForSubmittedReview(caseId!);

    const secondUserContext = await browser.newContext({ baseURL: BASE_URL });
    const secondUserPage = await secondUserContext.newPage();

    try {
      await signIn(secondUserPage, {
        email: E2E_SECOND_USER_EMAIL,
        password: E2E_SECOND_USER_PASSWORD,
      });
      await reviewExistingReport(secondUserPage, caseId!);
      await waitForSubmittedReview(caseId!, E2E_SECOND_USER_EMAIL);
      await waitForAggregatedReview(caseId!);

      const archiveLink = secondUserPage.getByRole('button', {
        name: 'Zum Fall',
      });
      await expect(archiveLink).toBeVisible();
      await archiveLink.click();
      await expect(secondUserPage).toHaveURL(`/archive/${caseId}`);
      await expect(secondUserPage.getByText('Infos zum Fall')).toBeVisible();
    } finally {
      await secondUserContext.close();
    }
  });
});
