import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveProductionBackend } from './resolve-production-backend.mjs';

const DEPLOYED = 'a'.repeat(40);
const FAILED = 'b'.repeat(40);
const FALLBACK = 'c'.repeat(40);

function response(body) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

test('uses the newest successful production deployment', async () => {
  const fetchImpl = async (url) => {
    if (url.includes('/deployments?')) {
      return response([
        { id: 2, sha: FAILED, created_at: '2026-09-08T12:00:00Z' },
        { id: 1, sha: DEPLOYED, created_at: '2026-09-07T12:00:00Z' },
      ]);
    }
    if (url.includes('/deployments/2/')) {
      return response([{ state: 'failure', created_at: '2026-09-08T12:01:00Z' }]);
    }
    return response([{ state: 'success', created_at: '2026-09-07T12:01:00Z' }]);
  };

  assert.deepEqual(await resolveProductionBackend(fetchImpl, FALLBACK), {
    sha: DEPLOYED,
    source: 'successful hetzner-production deployment',
  });
});

test('uses the bootstrap SHA before the first successful deployment', async () => {
  const result = await resolveProductionBackend(async () => response([]), FALLBACK);
  assert.deepEqual(result, { sha: FALLBACK, source: 'bootstrap repository variable' });
});

test('fails without a successful deployment or valid fallback', async () => {
  await assert.rejects(
    resolveProductionBackend(async () => response([]), 'main'),
    /no valid PRODUCTION_BACKEND_SHA fallback/i,
  );
});
