/**
 * Dev Pulse Dashboard - GitHub Data Generator
 * 
 * Fetches rich activity data from GitHub API using Octokit.
 * 
 * Usage:
 *   # With Replit GitHub connector (automatic auth):
 *   npm run generate
 * 
 *   # With GitHub token:
 *   GITHUB_TOKEN=ghp_xxx npm run generate
 * 
 *   # With custom username and token:
 *   GITHUB_TOKEN=ghp_xxx GITHUB_USERNAME=yourname npm run generate
 * 
 *   # Command line options:
 *   npm run generate -- --days=30 --output=../src/data/activity-data.json --debug
 */

import { Octokit } from '@octokit/rest';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface FileChange {
  file: string;
  added: number;
  deleted: number;
}

interface Commit {
  type: string;
  hash: string;
  shortHash: string;
  date: string;
  headline: string;
  body: string;
  repo: string;
  owner: string;
  repoSlug: string;
  remoteUrl: string;
  stats: {
    added: number;
    deleted: number;
    files: number;
  };
  files: FileChange[];
}

interface PullRequest {
  type: string;
  number: number;
  title: string;
  state: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  mergedAt: string | null;
  headBranch: string;
  baseBranch: string;
  repo: string;
  repoFull: string;
  owner: string;
  repoSlug: string;
  remoteUrl: string;
  url: string;
  additions: number;
  deletions: number;
  changedFiles: number;
  stats: {
    added: number;
    deleted: number;
    files: number;
  };
  body: string;
  reviewStatus: 'approved' | 'changes_requested' | 'pending' | 'review_required';
  commentsCount: number;
  ciStatus: 'success' | 'failure' | 'pending' | 'none';
  labels: string[];
}

interface RepoInfo {
  name: string;
  fullName: string;
  description: string | null;
  stars: number;
  language: string | null;
  topics: string[];
  forks: number;
  url: string;
  owner: string;
}

interface ActivityData {
  generatedAt: string;
  periodStart: string;
  commits: Commit[];
  prs: PullRequest[];
  repos: Record<string, RepoInfo>;
}

const EXCLUDE_PATTERNS = [
  /wp-fusion/i,
  /wpfusion/i,
  /dana/i,
];

function shouldExcludeRepo(repoName: string): boolean {
  return EXCLUDE_PATTERNS.some((p) => p.test(repoName));
}

function parseArgs(argv: string[]): Record<string, string | boolean> {
  const args: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    
    if (token.includes('=')) {
      const [key, value] = token.slice(2).split('=', 2);
      args[key] = value;
    } else {
      const key = token.slice(2);
      const nextToken = argv[i + 1];
      if (nextToken && !nextToken.startsWith('--')) {
        args[key] = nextToken;
        i++;
      } else {
        args[key] = true;
      }
    }
  }
  return args;
}

let connectionSettings: any;

async function getReplitAccessToken(): Promise<string | null> {
  try {
    if (connectionSettings?.settings?.expires_at && 
        new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
      return connectionSettings.settings.access_token;
    }
    
    const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
    if (!hostname) return null;
    
    const xReplitToken = process.env.REPL_IDENTITY 
      ? 'repl ' + process.env.REPL_IDENTITY 
      : process.env.WEB_REPL_RENEWAL 
      ? 'depl ' + process.env.WEB_REPL_RENEWAL 
      : null;

    if (!xReplitToken) return null;

    const response = await fetch(
      'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
      {
        headers: {
          'Accept': 'application/json',
          'X_REPLIT_TOKEN': xReplitToken
        }
      }
    );
    
    const data = await response.json();
    connectionSettings = data.items?.[0];

    const accessToken = connectionSettings?.settings?.access_token || 
                       connectionSettings?.settings?.oauth?.credentials?.access_token;

    return accessToken || null;
  } catch (error) {
    return null;
  }
}

async function getOctokit(): Promise<Octokit> {
  const envToken = process.env.GITHUB_TOKEN;
  if (envToken) {
    console.log('Using GITHUB_TOKEN from environment');
    return new Octokit({ auth: envToken });
  }
  
  const replitToken = await getReplitAccessToken();
  if (replitToken) {
    console.log('Using Replit GitHub connector');
    return new Octokit({ auth: replitToken });
  }
  
  throw new Error(
    'No GitHub authentication found.\n' +
    'Either:\n' +
    '  1. Set GITHUB_TOKEN environment variable\n' +
    '  2. Connect GitHub via Replit\'s connector panel'
  );
}

async function getAuthenticatedUser(octokit: Octokit): Promise<string> {
  const usernameFromEnv = process.env.GITHUB_USERNAME;
  if (usernameFromEnv) {
    return usernameFromEnv;
  }
  
  try {
    const { data: user } = await octokit.users.getAuthenticated();
    return user.login;
  } catch (error) {
    throw new Error(
      'Could not determine GitHub username. ' +
      'Please set GITHUB_USERNAME environment variable.'
    );
  }
}

async function fetchUserRepos(octokit: Octokit, username: string): Promise<RepoInfo[]> {
  const repos: RepoInfo[] = [];
  
  try {
    const iterator = octokit.paginate.iterator(octokit.repos.listForAuthenticatedUser, {
      per_page: 100,
      sort: 'pushed',
      direction: 'desc',
    });

    for await (const { data: repoPage } of iterator) {
      for (const repo of repoPage) {
        if (shouldExcludeRepo(repo.name)) continue;
        
        repos.push({
          name: repo.name,
          fullName: repo.full_name,
          description: repo.description,
          stars: repo.stargazers_count || 0,
          language: repo.language,
          topics: repo.topics || [],
          forks: repo.forks_count || 0,
          url: repo.html_url,
          owner: repo.owner?.login || username,
        });
      }
    }
  } catch (error: any) {
    console.warn('Warning: Could not fetch all repos:', error.message);
  }
  
  return repos;
}

async function fetchCommitsForRepo(
  octokit: Octokit,
  owner: string,
  repo: string,
  username: string,
  since: string,
  debug: boolean
): Promise<Commit[]> {
  const commits: Commit[] = [];
  
  try {
    const { data: repoCommits } = await octokit.repos.listCommits({
      owner,
      repo,
      author: username,
      since,
      per_page: 100,
    });

    for (const commit of repoCommits) {
      if (debug) {
        console.log(`  Processing commit ${commit.sha.substring(0, 7)}`);
      }
      
      try {
        const { data: commitDetail } = await octokit.repos.getCommit({
          owner,
          repo,
          ref: commit.sha,
        });

        const files: FileChange[] = (commitDetail.files || []).map(f => ({
          file: f.filename,
          added: f.additions || 0,
          deleted: f.deletions || 0,
        }));

        const stats = commitDetail.stats || { additions: 0, deletions: 0 };

        commits.push({
          type: 'commit',
          hash: commit.sha,
          shortHash: commit.sha.substring(0, 7),
          date: commit.commit.author?.date || new Date().toISOString(),
          headline: commit.commit.message.split('\n')[0],
          body: commit.commit.message.split('\n').slice(1).join('\n').trim(),
          repo,
          owner,
          repoSlug: repo,
          remoteUrl: `https://github.com/${owner}/${repo}`,
          stats: {
            added: stats.additions || 0,
            deleted: stats.deletions || 0,
            files: files.length,
          },
          files,
        });
      } catch (error: any) {
        if (debug) {
          console.warn(`  Warning: Could not fetch commit details for ${commit.sha}:`, error.message);
        }
      }
    }
  } catch (error: any) {
    if (debug) {
      console.warn(`Warning: Could not fetch commits for ${owner}/${repo}:`, error.message);
    }
  }
  
  return commits;
}

async function fetchPullRequests(
  octokit: Octokit,
  username: string,
  since: Date,
  debug: boolean
): Promise<PullRequest[]> {
  const prs: PullRequest[] = [];
  const sinceDate = since.toISOString().split('T')[0];
  
  try {
    const { data: searchResults } = await octokit.search.issuesAndPullRequests({
      q: `author:${username} type:pr created:>=${sinceDate}`,
      sort: 'created',
      order: 'desc',
      per_page: 50,
    });

    for (const item of searchResults.items) {
      const repoMatch = item.repository_url.match(/repos\/([^/]+)\/([^/]+)$/);
      if (!repoMatch) continue;
      
      const [, owner, repo] = repoMatch;
      
      if (shouldExcludeRepo(repo)) continue;
      
      if (debug) {
        console.log(`  Fetching PR #${item.number} in ${owner}/${repo}`);
      }

      try {
        const { data: pr } = await octokit.pulls.get({
          owner,
          repo,
          pull_number: item.number,
        });

        const { data: reviews } = await octokit.pulls.listReviews({
          owner,
          repo,
          pull_number: item.number,
        });

        let reviewStatus: PullRequest['reviewStatus'] = 'pending';
        const approvals = reviews.filter(r => r.state === 'APPROVED').length;
        const changesRequested = reviews.filter(r => r.state === 'CHANGES_REQUESTED').length;
        
        if (approvals > 0 && changesRequested === 0) {
          reviewStatus = 'approved';
        } else if (changesRequested > 0) {
          reviewStatus = 'changes_requested';
        } else if (reviews.length === 0) {
          reviewStatus = 'review_required';
        }

        let ciStatus: PullRequest['ciStatus'] = 'none';
        try {
          const { data: checkRuns } = await octokit.checks.listForRef({
            owner,
            repo,
            ref: pr.head.sha,
          });
          
          if (checkRuns.total_count > 0) {
            const conclusions = checkRuns.check_runs.map(cr => cr.conclusion);
            if (conclusions.every(c => c === 'success')) {
              ciStatus = 'success';
            } else if (conclusions.some(c => c === 'failure')) {
              ciStatus = 'failure';
            } else if (conclusions.some(c => c === null)) {
              ciStatus = 'pending';
            }
          }
        } catch {
          ciStatus = 'none';
        }

        prs.push({
          type: 'pr',
          number: pr.number,
          title: pr.title,
          state: pr.state,
          date: pr.created_at,
          createdAt: pr.created_at,
          updatedAt: pr.updated_at,
          mergedAt: pr.merged_at,
          headBranch: pr.head.ref,
          baseBranch: pr.base.ref,
          repo,
          repoFull: `${owner}/${repo}`,
          owner,
          repoSlug: repo,
          remoteUrl: `https://github.com/${owner}/${repo}`,
          url: pr.html_url,
          additions: pr.additions || 0,
          deletions: pr.deletions || 0,
          changedFiles: pr.changed_files || 0,
          stats: {
            added: pr.additions || 0,
            deleted: pr.deletions || 0,
            files: pr.changed_files || 0,
          },
          body: pr.body || '',
          reviewStatus,
          commentsCount: (pr.comments || 0) + (pr.review_comments || 0),
          ciStatus,
          labels: pr.labels.map(l => l.name || '').filter(Boolean),
        });
      } catch (error: any) {
        if (debug) {
          console.warn(`  Warning: Could not fetch PR #${item.number}:`, error.message);
        }
      }
    }
  } catch (error: any) {
    console.warn('Warning: Could not search PRs:', error.message);
  }
  
  return prs;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  
  const days = parseInt(args.days as string, 10) || 30;
  const outputFile = (args.output as string) || '../src/data/activity-data.json';
  const debug = args.debug === true;
  const maxRepos = parseInt(args['max-repos'] as string, 10) || 50;
  
  console.log('Dev Pulse Dashboard - GitHub Data Generator');
  console.log('============================================');
  console.log(`Fetching data for the last ${days} days`);
  
  const octokit = await getOctokit();
  const username = await getAuthenticatedUser(octokit);
  console.log(`Authenticated as: ${username}`);
  
  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - days);
  const sinceIso = sinceDate.toISOString();
  
  console.log(`\nFetching repos...`);
  const allRepos = await fetchUserRepos(octokit, username);
  const repos = allRepos.slice(0, maxRepos);
  console.log(`Found ${allRepos.length} repos, processing ${repos.length}`);
  
  const repoMap: Record<string, RepoInfo> = {};
  for (const repo of repos) {
    repoMap[repo.name] = repo;
  }
  
  console.log(`\nFetching commits from ${repos.length} repos...`);
  const allCommits: Commit[] = [];
  
  for (const repo of repos) {
    if (debug) {
      console.log(`Processing ${repo.owner}/${repo.name}...`);
    }
    
    const commits = await fetchCommitsForRepo(
      octokit,
      repo.owner,
      repo.name,
      username,
      sinceIso,
      debug
    );
    
    if (commits.length > 0) {
      console.log(`  ${repo.name}: ${commits.length} commits`);
      allCommits.push(...commits);
    }
  }
  
  console.log(`\nFetching pull requests...`);
  const prs = await fetchPullRequests(octokit, username, sinceDate, debug);
  console.log(`Found ${prs.length} PRs`);
  
  allCommits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  prs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const data: ActivityData = {
    generatedAt: new Date().toISOString(),
    periodStart: sinceIso,
    commits: allCommits,
    prs,
    repos: repoMap,
  };
  
  const outputPath = path.resolve(__dirname, outputFile);
  const outputDir = path.dirname(outputPath);
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  
  console.log(`\n============================================`);
  console.log(`Generated: ${outputPath}`);
  console.log(`  Commits: ${allCommits.length}`);
  console.log(`  PRs: ${prs.length}`);
  console.log(`  Repos: ${Object.keys(repoMap).length}`);
  
  const totalAdded = allCommits.reduce((sum, c) => sum + c.stats.added, 0);
  const totalDeleted = allCommits.reduce((sum, c) => sum + c.stats.deleted, 0);
  console.log(`  Lines: +${totalAdded.toLocaleString()} / -${totalDeleted.toLocaleString()}`);
}

main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
