import path from 'node:path';
import process from 'node:process';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

const E2E_TARGETS = ['local', 'staging'] as const;
type E2ETarget = (typeof E2E_TARGETS)[number];

const readTarget = (): E2ETarget => {
  const value = process.env.E2E_TARGET?.trim() || 'local';

  if (!E2E_TARGETS.includes(value as E2ETarget)) {
    throw new Error(
      `Invalid E2E_TARGET "${value}". Expected "local" or "staging".`,
    );
  }

  return value as E2ETarget;
};

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

export const E2E_TARGET = readTarget();
const isStaging = E2E_TARGET === 'staging';

if (isStaging) {
  process.loadEnvFile(path.join(process.cwd(), '.env.staging.local'));
}

export const AUTH_FILE = path.join(
  process.cwd(),
  `tests/e2e/.auth/${E2E_TARGET}-user.json`,
);

const STAGING_BASE_URL = 'https://staging.platform.codetekt.org';
const STAGING_SUPABASE_URL = 'https://ukepozbabcozowmxihdc.supabase.co';

export const BASE_URL = isStaging
  ? STAGING_BASE_URL
  : readRequiredEnv('E2E_LOCAL_BASE_URL');
export const SUPABASE_URL = isStaging
  ? STAGING_SUPABASE_URL
  : readRequiredEnv('E2E_LOCAL_SUPABASE_URL');
export const SUPABASE_SECRET_KEY = isStaging
  ? readRequiredEnv('E2E_STAGING_SUPABASE_SECRET_KEY')
  : readRequiredEnv('E2E_LOCAL_SUPABASE_SECRET_KEY');
export const E2E_USER_EMAIL = readRequiredEnv(
  isStaging ? 'E2E_STAGING_USER_EMAIL' : 'E2E_LOCAL_USER_EMAIL',
);
export const E2E_USER_PASSWORD = readRequiredEnv(
  isStaging ? 'E2E_STAGING_USER_PASSWORD' : 'E2E_LOCAL_USER_PASSWORD',
);
export const E2E_SECOND_USER_EMAIL = readRequiredEnv(
  isStaging
    ? 'E2E_STAGING_SECOND_USER_EMAIL'
    : 'E2E_LOCAL_SECOND_USER_EMAIL',
);
export const E2E_SECOND_USER_PASSWORD = readRequiredEnv(
  isStaging
    ? 'E2E_STAGING_SECOND_USER_PASSWORD'
    : 'E2E_LOCAL_SECOND_USER_PASSWORD',
);
export const E2E_USER_ID = readOptionalEnv(
  isStaging ? 'E2E_STAGING_USER_ID' : 'E2E_LOCAL_USER_ID',
);
export const E2E_SECOND_USER_ID = readOptionalEnv(
  isStaging ? 'E2E_STAGING_SECOND_USER_ID' : 'E2E_LOCAL_SECOND_USER_ID',
);
export const VERCEL_AUTOMATION_BYPASS_SECRET = isStaging
  ? readRequiredEnv('VERCEL_AUTOMATION_BYPASS_SECRET')
  : undefined;
export const START_WEB_SERVER = isLocalUrl(BASE_URL);
