import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const status = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const url = status.API_URL;
if (url !== 'http://127.0.0.1:55421') throw new Error('Expected isolated CI Supabase URL');
const publicKey = status.PUBLISHABLE_KEY ?? status.ANON_KEY;
const secretKey = status.SECRET_KEY ?? status.SERVICE_ROLE_KEY;
if (!publicKey || !secretKey) throw new Error('Missing local Supabase keys');
const client = createClient(url, secretKey, { auth: { persistSession: false } });
const env = {
  NEXT_PUBLIC_SUPABASE_URL: url,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: publicKey,
  E2E_LOCAL_BASE_URL: 'http://127.0.0.1:3000',
  E2E_LOCAL_SUPABASE_URL: url,
  E2E_LOCAL_SUPABASE_SECRET_KEY: secretKey,
};
for (const [index, prefix] of ['E2E_LOCAL_USER', 'E2E_LOCAL_SECOND_USER'].entries()) {
  const email = `frontend-ci-${index + 1}@example.test`;
  const password = 'Local-CI-test-password-123!';
  const { data, error } = await client.auth.admin.createUser({
    email, password, email_confirm: true,
    user_metadata: { username: `frontend-ci-${index + 1}` },
  });
  if (error) throw error;
  const { error: profileError } = await client.from('profiles').update({
    username: `frontend-ci-${index + 1}`,
    tutorial_completed_at: new Date().toISOString(),
  }).eq('id', data.user.id);
  if (profileError) throw profileError;
  Object.assign(env, { [`${prefix}_EMAIL`]: email, [`${prefix}_PASSWORD`]: password, [`${prefix}_ID`]: data.user.id });
}
fs.appendFileSync(process.env.GITHUB_ENV, Object.entries(env).map(([key, value]) => `${key}=${value}\n`).join(''));
fs.rmSync(process.argv[2]);
console.log('Created two disposable CI users.');
