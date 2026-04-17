import { defineConfig, devices } from '@playwright/test';
import {
  AUTH_FILE,
  BASE_URL,
  START_WEB_SERVER,
} from './tests/e2e/support/env';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  ...(START_WEB_SERVER
    ? {
        webServer: {
          command: 'npm run dev',
          url: BASE_URL,
          reuseExistingServer: true,
          timeout: 120_000,
        },
      }
    : {}),
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      dependencies: ['setup'],
      testIgnore: /.*\.setup\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: AUTH_FILE,
      },
    },
  ],
});
