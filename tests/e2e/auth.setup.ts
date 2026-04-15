import fs from 'node:fs/promises';
import path from 'node:path';
import { test as setup } from '@playwright/test';
import { AUTH_FILE } from './support/env';
import { signIn } from './support/flows';

setup('authenticate test user', async ({ page }) => {
  await signIn(page);
  await fs.mkdir(path.dirname(AUTH_FILE), { recursive: true });
  await page.context().storageState({ path: AUTH_FILE });
});
