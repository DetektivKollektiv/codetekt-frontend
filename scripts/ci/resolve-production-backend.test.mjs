import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveProductionBackend } from './resolve-production-backend.mjs';

const DEPLOYED = 'a'.repeat(40);
const FAILED = 'b'.repeat(40);

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

  assert.deepEqual(await resolveProductionBackend(fetchImpl), {
    sha: DEPLOYED,
    source: 'successful hetzner-production deployment',
  });
});

test('fails without a successful production deployment', async () => {
  await assert.rejects(
    resolveProductionBackend(async () => response([])),
    /no successful hetzner-production backend deployment found/i,
  );
});
