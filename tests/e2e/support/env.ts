import path from 'node:path';

export const AUTH_FILE = path.join(
  process.cwd(),
  'tests/e2e/.auth/user.json',
);

export const BASE_URL = 'http://localhost:3000';
export const SUPABASE_URL = 'http://127.0.0.1:54321';
export const SUPABASE_SERVICE_ROLE_KEY = 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz';
export const E2E_USER_EMAIL = 'gorm-labenz@hotmail.com';
export const E2E_USER_PASSWORD = 'testpassword123';
export const E2E_SECOND_USER_EMAIL = 'anna.schmidt@example.com';
export const E2E_SECOND_USER_PASSWORD = 'testpassword123';
