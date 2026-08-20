import { spawnSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: 'utf-8',
    ...options,
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(
      [`${command} ${args.join(' ')} failed with status ${result.status}`, result.stdout, result.stderr]
        .filter(Boolean)
        .join('\n')
    );
  }

  return result;
}

function initRepo(repoPath, repoName, authorEmail) {
  fs.mkdirSync(repoPath, { recursive: true });
  run('git', ['init'], { cwd: repoPath });
  run('git', ['config', 'user.name', 'Smoke Test'], { cwd: repoPath });
  run('git', ['config', 'user.email', authorEmail], { cwd: repoPath });
  run('git', ['remote', 'add', 'origin', `https://github.com/test/${repoName}.git`], { cwd: repoPath });

  fs.writeFileSync(path.join(repoPath, 'README.md'), `# ${repoName}\n`);
  run('git', ['add', 'README.md'], { cwd: repoPath });
  const commitDate = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  run('git', ['commit', '-m', `feat: seed ${repoName}`], {
    cwd: repoPath,
    env: {
      ...process.env,
      GIT_AUTHOR_DATE: commitDate,
      GIT_COMMITTER_DATE: commitDate,
    },
  });
}

function writeFakeGh(binDir) {
  const ghPath = path.join(binDir, 'gh');
  const script = `#!/usr/bin/env node
const args = process.argv.slice(2);
const getArgValue = (flag) => {
  const inline = args.find((arg) => arg.startsWith(flag + '='));
  if (inline) return inline.slice(flag.length + 1).replace(/^"|"$/g, '');
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
};

if (args[0] === 'search' && args[1] === 'prs') {
  const repoFull = getArgValue('--repo');
  const limit = Number(getArgValue('--limit') || '0');
  const repoName = repoFull.split('/')[1];
  const base = repoName === 'repo-one' ? 100 : repoName === 'repo-two' ? 200 : 300;
  const total = repoName === 'skip-me' ? 0 : 15;
  const results = Array.from({ length: Math.min(limit, total) }, (_, index) => ({
    number: base + index,
    url: 'https://github.com/' + repoFull + '/pull/' + (base + index),
    createdAt: '2026-03-30T10:' + String(index).padStart(2, '0') + ':00Z',
    repository: {
      name: repoName,
      nameWithOwner: repoFull
    }
  }));
  process.stdout.write(JSON.stringify(results));
  process.exit(0);
}

if (args[0] === 'pr' && args[1] === 'view') {
  const number = Number(args[2]);
  const repoFull = getArgValue('--repo');
  const repoName = repoFull.split('/')[1];
  process.stdout.write(JSON.stringify({
    number,
    title: 'PR ' + number,
    url: 'https://github.com/' + repoFull + '/pull/' + number,
    state: 'MERGED',
    createdAt: '2026-03-30T11:00:00Z',
    additions: number,
    deletions: 1,
    changedFiles: 1,
    commits: [{ oid: 'abc123' }],
    baseRefName: 'main',
    headRefName: 'feature-' + number,
    mergeable: 'MERGEABLE',
    reviews: [],
    labels: [],
    files: [{ path: 'README.md', additions: 1, deletions: 0 }],
    body: 'Synthetic PR for ' + repoName
  }));
  process.exit(0);
}

process.exit(1);
`;

  fs.writeFileSync(ghPath, script);
  fs.chmodSync(ghPath, 0o755);
}

const generatorScript = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'generate-rich-report.mjs');
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'activity-report-'));
try {
  const authorEmail = 'smoke@example.com';
  const rootA = path.join(tempDir, 'Projects');
  const rootB = path.join(tempDir, 'Local Sites');
  const repoOne = path.join(rootA, 'repo-one');
  const repoTwo = path.join(rootB, 'repo-two');
  const excludedRepo = path.join(rootA, 'skip-me');
  const cacheFile = path.join(tempDir, 'activity-data.json');
  const prCacheFile = path.join(tempDir, 'activity-data-prs.json');
  const fakeBin = path.join(tempDir, 'bin');

  fs.mkdirSync(fakeBin, { recursive: true });
  initRepo(repoOne, 'repo-one', authorEmail);
  initRepo(repoTwo, 'repo-two', authorEmail);
  initRepo(excludedRepo, 'skip-me', authorEmail);
  writeFakeGh(fakeBin);

  run(
    process.execPath,
    [
      generatorScript,
      '--paths',
      `${rootA},${rootB}`,
      '--hours',
      '48',
      '--author',
      authorEmail,
      '--exclude',
      'skip-me',
      '--no-prs',
      '--cache-file',
      cacheFile,
    ],
    { cwd: tempDir }
  );

  const data = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
  assert(data.commits.length === 2, `expected 2 commits, got ${data.commits.length}`);
  assert(Object.keys(data.repos).length === 2, `expected 2 repos, got ${Object.keys(data.repos).length}`);
  assert(data.repos['repo-one'], 'repo-one missing from generated data');
  assert(data.repos['repo-two'], 'repo-two missing from generated data');
  assert(!data.repos['skip-me'], 'excluded repo should not be present');
  assert(data.diagnostics.scan.configuredRoots.length === 2, 'configured scan roots not recorded');
  assert(data.diagnostics.scan.reposWithCommits === 2, 'reposWithCommits diagnostics incorrect');
  assert(data.diagnostics.scan.excludedRepos === 1, 'excludedRepos diagnostics incorrect');
  assert(data.diagnostics.prs.enabled === false, 'PR diagnostics should be disabled in no-prs mode');

  const workEmail = 'work@example.com';
  const repoWork = path.join(rootA, 'repo-work');
  initRepo(repoWork, 'repo-work', workEmail);
  const multiAuthorCache = path.join(tempDir, 'activity-data-multi-author.json');

  run(
    process.execPath,
    [
      generatorScript,
      '--paths',
      rootA,
      '--hours',
      '48',
      '--author',
      `${authorEmail},${workEmail}`,
      '--exclude',
      'skip-me',
      '--no-prs',
      '--cache-file',
      multiAuthorCache,
    ],
    { cwd: tempDir }
  );

  const multiData = JSON.parse(fs.readFileSync(multiAuthorCache, 'utf-8'));
  assert(multiData.commits.length === 2, `expected 2 commits from both author emails, got ${multiData.commits.length}`);
  assert(multiData.repos['repo-one'], 'gmail-authored repo-one missing when filtering both emails');
  assert(multiData.repos['repo-work'], 'second-email repo-work missing from multi-author generate');
  assert(
    String(multiData.diagnostics.authorEmail).includes(workEmail),
    `diagnostics should list both author emails, got ${multiData.diagnostics.authorEmail}`
  );

  const defaultBranch = run('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: repoOne }).stdout.trim();
  run('git', ['checkout', '-b', 'agent/side-work'], { cwd: repoOne });
  fs.appendFileSync(path.join(repoOne, 'README.md'), '\nside work\n');
  run('git', ['add', 'README.md'], { cwd: repoOne });
  const sideDate = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  run('git', ['commit', '-m', 'feat: side branch'], {
    cwd: repoOne,
    env: {
      ...process.env,
      GIT_AUTHOR_DATE: sideDate,
      GIT_COMMITTER_DATE: sideDate,
    },
  });
  run('git', ['checkout', defaultBranch], { cwd: repoOne });

  const branchCache = path.join(tempDir, 'activity-data-branches.json');
  run(
    process.execPath,
    [
      generatorScript,
      '--paths',
      rootA,
      '--hours',
      '48',
      '--author',
      authorEmail,
      '--exclude',
      'skip-me',
      '--no-prs',
      '--cache-file',
      branchCache,
    ],
    { cwd: tempDir }
  );

  const branchData = JSON.parse(fs.readFileSync(branchCache, 'utf-8'));
  const repoOneCommits = branchData.commits.filter(c => c.repo === 'repo-one');
  assert(
    repoOneCommits.length === 2,
    `expected commits from current branch and un-checked-out local branches, got ${repoOneCommits.length}`
  );

  run(
    process.execPath,
    [
      generatorScript,
      '--paths',
      `${rootA},${rootB}`,
      '--hours',
      '48',
      '--author',
      authorEmail,
      '--gh-author',
      'smoke-user',
      '--pr-per-repo-limit',
      '50',
      '--cache-file',
      prCacheFile,
    ],
    {
      cwd: tempDir,
      env: {
        ...process.env,
        PATH: `${fakeBin}${path.delimiter}${process.env.PATH}`,
        GH_TOKEN: 'smoke-token',
      },
    }
  );

  const prData = JSON.parse(fs.readFileSync(prCacheFile, 'utf-8'));
  assert(prData.prs.length === 30, `expected 30 PRs without a global cap, got ${prData.prs.length}`);
  assert(prData.diagnostics.prs.repoQueries === 3, `expected 3 repo queries, got ${prData.diagnostics.prs.repoQueries}`);
  assert(prData.diagnostics.prs.dedupedPullRequests === 30, 'deduped PR count incorrect');
  assert(prData.diagnostics.prs.perRepoLimit === 50, 'per-repo PR limit diagnostics incorrect');
  assert(prData.diagnostics.prs.possiblyTruncatedRepos.length === 0, 'unexpected PR truncation warning');
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true });
}

console.log('Smoke test passed');

