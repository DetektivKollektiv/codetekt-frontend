import { randomUUID } from 'node:crypto';
import { expect, type Page } from '@playwright/test';
import { E2E_USER_EMAIL, E2E_USER_PASSWORD } from './env';
import { waitForCaseByContent } from './supabase';

export const createMarker = (prefix: string) =>
  `${prefix}-${Date.now()}-${randomUUID()}`;

export const caseContentFor = (marker: string) =>
  `https://example.com/codetekt-e2e-${marker}`;

export const signIn = async (
  page: Page,
  credentials = {
    email: E2E_USER_EMAIL,
    password: E2E_USER_PASSWORD,
  },
) => {
  await page.goto('/auth/login');
  await page.getByLabel('Email').fill(credentials.email);
  await page.getByLabel('Passwort').fill(credentials.password);
  await page.getByRole('button', { name: 'Anmelden' }).click();
  await expect(page).toHaveURL(/\/$/);
};

export const createCase = async (page: Page, marker: string) => {
  const content = caseContentFor(marker);

  await page.goto('/submit');
  await page.getByLabel('Bitte gib hier einen Link ein').fill(content);
  await page.getByRole('button', { name: 'Fall einreichen' }).click();

  const caseRecord = await waitForCaseByContent(content);

  return {
    caseId: caseRecord.id,
    content,
  };
};

const answerVisibleTrafficLights = async (page: Page) => {
  const fieldIds = await page
    .locator('[data-testid="review-traffic-light-option"]:visible')
    .evaluateAll((elements) =>
      Array.from(
        new Set(
          elements
            .map((element) => (element as HTMLElement).dataset.fieldId)
            .filter((fieldId): fieldId is string => Boolean(fieldId)),
        ),
      ),
    );

  if (fieldIds.length === 0) {
    throw new Error('No visible traffic-light fields found on review step.');
  }

  for (const fieldId of fieldIds) {
    await page
      .locator(
        `[data-testid="review-traffic-light-option"][data-field-id="${fieldId}"][data-answer-value="0"]`,
      )
      .first()
      .click();
  }
};

const saveMetadataStep = async (page: Page) => {
  await page.getByRole('button', { name: 'Speichern' }).click();
};

const fillBasicReviewMetadata = async (
  page: Page,
  titlePrefix: string,
  category: 'Bericht' | 'Satire',
) => {
  await page.getByLabel('Titel').fill(`${titlePrefix} ${Date.now()}`);
  await saveMetadataStep(page);

  await page.getByLabel('Stichwort eingeben (max. 50 Zeichen)').fill('Stichwort');
  await page.getByRole('button', { name: 'Hinzufügen' }).click();
  await saveMetadataStep(page);

  await page.getByRole('button', { name: category }).click();
  await saveMetadataStep(page);
};

const selectNoFactcheck = async (page: Page) => {
  await page
    .getByRole('button', { name: /Nein\s+Es liegt kein Faktencheck vor\./ })
    .click();
  await saveMetadataStep(page);
};

const confirmExistingReportMetadata = async (page: Page) => {
  await page.getByRole('button', { name: 'Der Titel passt' }).click();
  await page.getByRole('button', { name: 'Die Stichwörter passen' }).click();
  await page.getByRole('button', { name: 'Die Kategorie passt' }).click();
  await page.getByRole('button', { name: 'Faktencheck passt' }).click();
};

const selectExistingFactcheck = async (page: Page) => {
  await page
    .getByRole('button', { name: /Ja\s+Es gibt bereits einen Faktencheck\./ })
    .click();
  await page
    .getByLabel('URL zum Faktencheck')
    .fill(`https://example.com/codetekt-e2e-factcheck-${Date.now()}`);
  await saveMetadataStep(page);
};

const submitReviewWithComment = async (page: Page) => {
  await expect(page.getByLabel('Abschlusskommentar')).toBeVisible();
  await page.getByLabel('Abschlusskommentar').fill(`Ein Test Kommentar ${Date.now()}`);
  await page.getByRole('button', { name: 'Kommentar speichern' }).click();
  await page.getByRole('button', { name: 'Weiter zum Abschließen' }).click();
  await page.getByTestId('submit-review').click();
  await expect(
    page.getByText('Geschafft! Danke für deine Bewertung!'),
  ).toBeVisible();
};

const answerReportQuestionsAndSubmit = async (page: Page) => {
  await expect(
    page.locator('[data-testid="review-traffic-light-option"]').first(),
  ).toBeVisible();

  for (let questionIndex = 0; questionIndex < 20; questionIndex += 1) {
    if (await page.getByLabel('Abschlusskommentar').isVisible()) break;

    await answerVisibleTrafficLights(page);
    const saveButton = page.getByRole('button', { name: 'Speichern' });
    await expect(saveButton).toBeEnabled();
    await saveButton.click();
    await expect(saveButton).toBeDisabled();
    await page.getByRole('button', { name: 'Nächste Frage' }).click();
  }

  await submitReviewWithComment(page);
};

export const reviewReport = async (page: Page, caseId: string) => {
  await page.goto(`/review/${caseId}`);
  await fillBasicReviewMetadata(page, 'E2E Report Review', 'Bericht');
  await selectNoFactcheck(page);
  await answerReportQuestionsAndSubmit(page);
};

export const reviewExistingReport = async (page: Page, caseId: string) => {
  await page.goto(`/review/${caseId}`);
  await confirmExistingReportMetadata(page);
  await answerReportQuestionsAndSubmit(page);
};

export const reviewSatire = async (page: Page, caseId: string) => {
  await page.goto(`/review/${caseId}`);
  await fillBasicReviewMetadata(page, 'E2E Satire Review', 'Satire');
  await selectNoFactcheck(page);
  await submitReviewWithComment(page);
};

export const reviewFactchecked = async (page: Page, caseId: string) => {
  await page.goto(`/review/${caseId}`);
  await fillBasicReviewMetadata(page, 'E2E Factchecked Review', 'Bericht');
  await selectExistingFactcheck(page);
  await submitReviewWithComment(page);
};
