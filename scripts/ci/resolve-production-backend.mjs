import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

const API = 'https://api.github.com/repos/DetektivKollektiv/codetekt-supabase';
const SHA = /^[a-f0-9]{40}$/;

async function githubJson(fetchImpl, path) {
  const response = await fetchImpl(`${API}${path}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'codetekt-frontend-ci',
      'X-GitHub-Api-Version': '2026-03-10',
    },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) {
    throw new Error(`GitHub API ${path} returned HTTP ${response.status}`);
  }
  return response.json();
}

export async function resolveProductionBackend(fetchImpl) {
  const deployments = await githubJson(
    fetchImpl,
    '/deployments?environment=hetzner-production&per_page=20',
  );
  if (!Array.isArray(deployments)) throw new Error('Invalid GitHub deployments response');

  deployments.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
  for (const deployment of deployments) {
    if (!SHA.test(deployment.sha ?? '')) continue;
    const statuses = await githubJson(fetchImpl, `/deployments/${deployment.id}/statuses?per_page=20`);
    if (!Array.isArray(statuses)) throw new Error('Invalid GitHub deployment statuses response');
    statuses.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
    if (statuses[0]?.state === 'success') {
      return { sha: deployment.sha, source: 'successful hetzner-production deployment' };
    }
  }

  throw new Error('No successful hetzner-production backend deployment found');
}

async function main() {
  const result = await resolveProductionBackend(fetch);
  if (!process.env.GITHUB_OUTPUT) throw new Error('GITHUB_OUTPUT is missing');
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `sha=${result.sha}\n`);
  console.log(`Using backend ${result.sha} from ${result.source}.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
