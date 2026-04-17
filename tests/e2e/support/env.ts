import path from 'node:path';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

const isEnabled = (value: string | undefined) =>
  value === 'true' || value === '1';

const readRequiredEnv = (name: string) => {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `Missing required environment variable ${name} for E2E tests.`,
    );
  }

  return value;
};

const readOptionalEnv = (name: string) => {
  const value = process.env[name]?.trim();
  return value || undefined;
};

const isLocalUrl = (url: string) => {
  try {
    const hostname = new URL(url).hostname;
    return hostname === 'localhost' || hostname === '127.0.0.1';
  } catch {
    return false;
  }
};

export const TEST_PRODUCTION = isEnabled(process.env.TEST_PRODUCTION);

const requireProductionWriteConfirmation = () => {
  if (!isEnabled(process.env.E2E_ALLOW_PRODUCTION_WRITES)) {
    throw new Error(
      'TEST_PRODUCTION=true writes data to the configured Supabase project. Set E2E_ALLOW_PRODUCTION_WRITES=true to confirm.',
    );
  }
};

export const AUTH_FILE = path.join(
  process.cwd(),
  `tests/e2e/.auth/${TEST_PRODUCTION ? 'production' : 'local'}-user.json`,
);

if (TEST_PRODUCTION) {
  requireProductionWriteConfirmation();
}

export const BASE_URL = TEST_PRODUCTION
  ? readRequiredEnv('E2E_BASE_URL')
  : readRequiredEnv('E2E_LOCAL_BASE_URL');
export const SUPABASE_URL = TEST_PRODUCTION
  ? readRequiredEnv('E2E_SUPABASE_URL')
  : readRequiredEnv('E2E_LOCAL_SUPABASE_URL');
export const SUPABASE_SERVICE_ROLE_KEY = TEST_PRODUCTION
  ? readRequiredEnv('E2E_SUPABASE_SERVICE_ROLE_KEY')
  : readRequiredEnv('E2E_LOCAL_SUPABASE_SERVICE_ROLE_KEY');
export const E2E_USER_EMAIL = TEST_PRODUCTION
  ? readRequiredEnv('E2E_USER_EMAIL')
  : readRequiredEnv('E2E_LOCAL_USER_EMAIL');
export const E2E_USER_PASSWORD = TEST_PRODUCTION
  ? readRequiredEnv('E2E_USER_PASSWORD')
  : readRequiredEnv('E2E_LOCAL_USER_PASSWORD');
export const E2E_SECOND_USER_EMAIL = TEST_PRODUCTION
  ? readRequiredEnv('E2E_SECOND_USER_EMAIL')
  : readRequiredEnv('E2E_LOCAL_SECOND_USER_EMAIL');
export const E2E_SECOND_USER_PASSWORD = TEST_PRODUCTION
  ? readRequiredEnv('E2E_SECOND_USER_PASSWORD')
  : readRequiredEnv('E2E_LOCAL_SECOND_USER_PASSWORD');
export const E2E_USER_ID = TEST_PRODUCTION
  ? readOptionalEnv('E2E_USER_ID')
  : readOptionalEnv('E2E_LOCAL_USER_ID');
export const E2E_SECOND_USER_ID = TEST_PRODUCTION
  ? readOptionalEnv('E2E_SECOND_USER_ID')
  : readOptionalEnv('E2E_LOCAL_SECOND_USER_ID');
export const START_WEB_SERVER = isLocalUrl(BASE_URL);

if (TEST_PRODUCTION && isLocalUrl(SUPABASE_URL)) {
  throw new Error(
    'TEST_PRODUCTION=true requires E2E_SUPABASE_URL to point to a non-local Supabase project.',
  );
}
