/**
 * Ultimate Developer Activity Report
 * Data-rich: commits, PRs, reviews, branches, files, LOC
 * Cached: JSON for fast re-renders
 * Linked: Everything clickable to GitHub
 */
import { execSync } from "child_process";
import os from "os";
import path from "path";
import fs from "fs";

// Repo exclusion patterns (populated from --exclude flag or config.json)
let EXCLUDE_PATTERNS = [];

function shouldExcludeRepo(repoName) {
  return EXCLUDE_PATTERNS.some((p) => p.test(repoName));
}

function loadConfigFile() {
  const configPath = path.join(process.cwd(), "config.json");
  if (!fs.existsSync(configPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(configPath, "utf-8"));
  } catch (e) {
    console.warn("Warning: could not parse config.json:", e.message);
    return {};
  }
}

function expandHome(inputPath) {
  if (!inputPath) return inputPath;
  if (inputPath === "~") return os.homedir();
  if (inputPath.startsWith("~/"))
    return path.join(os.homedir(), inputPath.slice(2));
  return inputPath;
}

function readGitConfigValue(key) {
  try {
    // Try global first (user's actual config), then fall back to local
    const globalValue = execSync(`git config --global --get ${key}`, {
      encoding: "utf-8",
    }).trim();
    if (globalValue) return globalValue;
    
    const localValue = execSync(`git config --get ${key}`, {
      encoding: "utf-8",
    }).trim();
    return localValue || undefined;
  } catch {
    return undefined;
  }
}

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith("--")) {
      args._.push(token);
      continue;
    }
    if (token === "--no-prs") {
      args.prs = false;
      continue;
    }
    if (token === "--prs") {
      args.prs = true;
      continue;
    }
    if (token === "--cached") {
      args.cached = true;
      continue;
    }
    if (token === "--no-cache-write") {
      args.cacheWrite = false;
      continue;
    }

    const [keyPart, inlineValue] = token.split("=", 2);
    const key = keyPart.slice(2);
    const value = inlineValue ?? argv[++i];
    args[key] = value;
  }
  return args;
}

function parseNumber(value, fallback) {
  if (value === undefined) return fallback;
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function splitCommaList(value) {
  if (!value) return [];
  return String(value)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function shouldSkipDir(name) {
  return (
    name === "node_modules" ||
    name === ".git" ||
    name === ".next" ||
    name === "dist" ||
    name === "build" ||
    name === ".cache"
  );
}

function findGitReposUnder(rootDir, maxDepth) {
  const repos = [];
  const stack = [{ dir: rootDir, depth: 0 }];

  while (stack.length) {
    const { dir, depth } = stack.pop();
    if (depth > maxDepth) continue;

    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }

    let hasGitDir = false;
    for (const entry of entries) {
      if (entry.isDirectory() && entry.name === ".git") {
        hasGitDir = true;
        break;
      }
    }

    if (hasGitDir) {
      repos.push(dir);
      continue;
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (shouldSkipDir(entry.name)) continue;
      stack.push({ dir: path.join(dir, entry.name), depth: depth + 1 });
    }
  }

  return repos;
}

function safeExec(command, options) {
  try {
    return execSync(command, options);
  } catch {
    return null;
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const config = loadConfigFile();

  const hoursBack = parseNumber(args.hours, config.hours || 840);
  const maxDepth = parseNumber(args["max-depth"], config.maxDepth || 4);
  const cacheFile = args["cache-file"] || "activity-data.json";
  const outputFile = args["output-file"] || "index.html";
  const useCache = Boolean(args.cached);
  const writeCache = args.cacheWrite !== false;
  const includePrs = args.prs !== false;

  // Build exclude patterns from --exclude flag or config.json
  const excludeArg = splitCommaList(args.exclude);
  const excludeConfig = config.exclude || [];
  const excludeList = excludeArg.length > 0 ? excludeArg : excludeConfig;
  EXCLUDE_PATTERNS = excludeList.map((p) => new RegExp(p, "i"));

  const authorEmail =
    args.author ||
    process.env.ACTIVITY_REPORT_AUTHOR_EMAIL ||
    config.author ||
    readGitConfigValue("user.email");

  const repoPathsFromArgs = splitCommaList(args.paths);
  const configPaths = config.paths || [];
  const repoRoots =
    repoPathsFromArgs.length > 0
      ? repoPathsFromArgs
      : configPaths.length > 0
        ? configPaths
        : [
            path.join(os.homedir(), "Projects"),
            path.join(os.homedir(), "Local Sites"),
          ];

  const repoRootsResolved = repoRoots
    .map((p) => expandHome(p))
    .map((p) => path.resolve(process.cwd(), p))
    .filter((p) => fs.existsSync(p));

  if (repoRootsResolved.length === 0) {
    console.warn(
      "Warning: No scan paths found. Use --paths or create a config.json with a \"paths\" array."
    );
  }

  let data;

  if (useCache && fs.existsSync(cacheFile)) {
    console.log("Using cached data");
    data = JSON.parse(fs.readFileSync(cacheFile, "utf-8"));
  } else {
    console.log("Fetching fresh data...");
    data = await fetchData({
      hoursBack,
      authorEmail,
      repoRoots: repoRootsResolved,
      maxDepth,
      includePrs,
      ghAuthor:
        args["gh-author"] || process.env.ACTIVITY_REPORT_GH_AUTHOR || config.ghAuthor || "@me",
    });
    if (writeCache) {
      fs.mkdirSync(path.dirname(cacheFile), { recursive: true });
      fs.writeFileSync(cacheFile, JSON.stringify(data, null, 2));
      console.log("Cached to", cacheFile);
    }
  }
  // HTML generation disabled - using static index.html that loads activity-data.json
  // generateHtml(data, { outputFile, hoursBack });
}

async function fetchData({
  hoursBack,
  authorEmail,
  repoRoots,
  maxDepth,
  includePrs,
  ghAuthor,
}) {
  const sinceDate = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
  const sinceIso = sinceDate.toISOString();
  console.log(`   Since: ${sinceIso}`);

  const data = {
    generatedAt: new Date().toISOString(),
    periodStart: sinceIso,
    commits: [],
    prs: [],
    repos: {},
    stats: { additions: 0, deletions: 0, files: 0, commits: 0, prs: 0 },
  };

  // 1. Local Repos
  for (const basePath of repoRoots) {
    for (const repoPath of findGitReposUnder(basePath, maxDepth)) {
      const repoName = path.basename(repoPath);

      if (shouldExcludeRepo(repoName)) continue;

      let remoteUrl = "";
      let owner = "",
        repoSlug = "";

      const remoteRaw = safeExec(
        `git -C "${repoPath}" config --get remote.origin.url`,
        {
          encoding: "utf-8",
        }
      )?.trim();

      if (remoteRaw) {
        remoteUrl = remoteRaw;
        const match = remoteUrl.match(/github\.com[:/]([^/]+)\/([^/.]+)/);
        if (match) {
          owner = match[1];
          repoSlug = match[2];
        }
        if (remoteUrl.startsWith("git@")) {
          remoteUrl = remoteUrl
            .replace("git@github.com:", "https://github.com/")
            .replace(".git", "");
        } else if (remoteUrl.endsWith(".git")) {
          remoteUrl = remoteUrl.slice(0, -4);
        }
      }

      const authorFilter = authorEmail ? ` --author="${authorEmail}"` : "";
      const log = safeExec(
        `git -C "${repoPath}" log${authorFilter} --since="${sinceIso}" --pretty=format:"===COMMIT===%n%H%x1f%aI%x1f%s%x1f%b%x1f===STATS===" --numstat --no-merges 2>/dev/null`,
        { encoding: "utf-8", maxBuffer: 20 * 1024 * 1024 }
      );

      if (!log?.trim()) continue;

      const blocks = log.split("===COMMIT===").filter(Boolean);
      let repoAdd = 0,
        repoDel = 0,
        repoCommits = 0;

      for (const block of blocks) {
        // Split by ===STATS=== to separate commit info from numstat
        const [commitInfo, statsSection] = block.split("===STATS===");
        if (!commitInfo) continue;

        const parts = commitInfo.trim().split("\x1f");
        const [hash, dateStr, headline] = parts;
        // Body is everything between headline and ===STATS===, may contain newlines
        const body = (parts[3] || "").trim();

        const statLines = (statsSection || "").trim().split("\n").filter(Boolean);

        let added = 0,
          deleted = 0;
        const files = [];
        statLines.forEach((line) => {
          const [a, d, f] = line.split("\t");
          if (!f) return;
          const ad = parseInt(a, 10);
          const dd = parseInt(d, 10);
          if (!Number.isNaN(ad)) added += ad;
          if (!Number.isNaN(dd)) deleted += dd;
          files.push({
            file: f,
            added: Number.isNaN(ad) ? 0 : ad,
            deleted: Number.isNaN(dd) ? 0 : dd,
          });
        });

        const prMatch = headline.match(/\(#(\d+)\)/);
        data.commits.push({
          type: "commit",
          hash,
          shortHash: hash.substring(0, 7),
          date: dateStr,
          headline,
          body: body || "",
          repo: repoName,
          owner,
          repoSlug,
          remoteUrl,
          prNumber: prMatch?.[1],
          stats: { added, deleted, files: files.length },
          files,
        });

        repoAdd += added;
        repoDel += deleted;
        repoCommits++;
        data.stats.additions += added;
        data.stats.deletions += deleted;
        data.stats.files += files.length;
      }

      if (repoCommits > 0) {
        data.repos[repoName] = {
          commits: repoCommits,
          additions: repoAdd,
          deletions: repoDel,
          remoteUrl,
          owner,
          repoSlug,
        };
        data.stats.commits += repoCommits;
      }
    }
  }

  // 2. PRs with full details
  if (includePrs) {
    console.log("   Fetching PRs...");
    const dateFilter = sinceDate.toISOString().split("T")[0];
      const reposWithGitHubRemote = Object.values(data.repos)
        .filter((r) => r?.owner && r?.repoSlug)
        .sort((a, b) => (b.commits || 0) - (a.commits || 0));

      const maxReposToQuery = 12;
      const perRepoLimit = 5;
      let prList = [];

      if (reposWithGitHubRemote.length > 0) {
        const candidateRepos = reposWithGitHubRemote.slice(0, maxReposToQuery);
        const seen = new Set();

        for (const repo of candidateRepos) {
          const repoFull = `${repo.owner}/${repo.repoSlug}`;
          const search = safeExec(
            `gh search prs --author="${ghAuthor}" --created=">=${dateFilter}" --repo="${repoFull}" --limit ${perRepoLimit} --json number,repository,url,createdAt 2>/dev/null`,
            { encoding: "utf-8" }
          );
          if (!search) continue;
          for (const pr of JSON.parse(search)) {
            const key = pr?.url || `${pr?.repository?.nameWithOwner}#${pr?.number}`;
            if (!key || seen.has(key)) continue;
            seen.add(key);
            prList.push(pr);
          }
        }

        prList.sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        prList = prList.slice(0, 20);
      } else {
        const search = safeExec(
          `gh search prs --author="${ghAuthor}" --created=">=${dateFilter}" --limit 20 --json number,repository,url,createdAt 2>/dev/null`,
          { encoding: "utf-8" }
        );
        if (!search) {
          console.error("ERROR: gh CLI not available or not authenticated. Set GH_TOKEN environment variable.");
          process.exit(1);
        }
        prList = JSON.parse(search);
      }

      for (const pr of prList) {
        try {
          const detailRaw = safeExec(
            `gh pr view ${pr.number} --repo ${pr.repository.nameWithOwner} --json number,title,url,state,createdAt,additions,deletions,changedFiles,commits,baseRefName,headRefName,mergeable,reviews,labels,files,body`,
            { encoding: "utf-8" }
          );
          if (!detailRaw) continue;
          const detail = JSON.parse(detailRaw);
          data.prs.push({
            type: "pr",
            number: detail.number,
            title: detail.title,
            url: detail.url,
            state: detail.state,
            date: detail.createdAt,
            repo: pr.repository.name,
            repoFull: pr.repository.nameWithOwner,
            stats: {
              added: detail.additions,
              deleted: detail.deletions,
              files: detail.changedFiles,
            },
            baseBranch: detail.baseRefName,
            headBranch: detail.headRefName,
            mergeable: detail.mergeable,
            commits: detail.commits?.length || 0,
            reviews: (detail.reviews || []).map((r) => ({
              author: r.author?.login,
              state: r.state,
              submittedAt: r.submittedAt,
            })),
            labels: (detail.labels || []).map((l) => l.name),
            files: (detail.files || []).map((f) => ({
              file: f.path,
              added: f.additions,
              deleted: f.deletions,
            })),
            body: detail.body || '',
          });
          data.stats.prs++;
        } catch {}
      }
  }

  // Sort
  data.commits.sort((a, b) => new Date(b.date) - new Date(a.date));
  data.prs.sort((a, b) => new Date(b.date) - new Date(a.date));

  return data;
}

function generateHtml(data, { outputFile, hoursBack }) {
  const repos = Object.keys(data.repos);
  const colors = [
    "#3B82F6",
    "#8B5CF6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#EC4899",
    "#6366F1",
    "#14B8A6",
    "#84CC16",
    "#06B6D4",
  ];
  const repoColors = {};
  repos.forEach((r, i) => (repoColors[r] = colors[i % colors.length]));

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Activity Report</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root { --bg:#F8FAFC;--surface:#FFF;--border:#E2E8F0;--text:#0F172A;--muted:#64748B;--green:#166534;--red:#991B1B;--blue:#3B82F6; }
    * { margin:0;padding:0;box-sizing:border-box; }
    body { background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;line-height:1.5;padding:2rem; }
    a { color:inherit; }
    a:hover { color:var(--blue); }
    .container { max-width:1200px;margin:0 auto; }

    /* Header */
    .header { display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:3rem;flex-wrap:wrap;gap:2rem; }
    h1 { font-size:2.5rem;font-weight:700;letter-spacing:-0.02em; }
    .subtitle { color:var(--muted);margin-top:0.25rem; }
    .stats-row { display:flex;gap:1.5rem; }
    .stat { background:var(--surface);border:1px solid var(--border);padding:1.25rem 1.5rem;border-radius:0.75rem;text-align:center;min-width:100px; }
    .stat-val { font-size:1.75rem;font-weight:700;font-family:'JetBrains Mono',monospace; }
    .stat-label { font-size:0.8rem;color:var(--muted);font-weight:500; }

    /* Repos */
    .repos { display:flex;flex-wrap:wrap;gap:0.5rem;margin-bottom:2rem;padding:1rem;background:var(--surface);border-radius:0.75rem;border:1px solid var(--border); }
    .repo-chip { font-size:0.8rem;font-family:'JetBrains Mono',monospace;padding:0.25rem 0.75rem;border-radius:2rem;background:var(--bg);border:1px solid var(--border);display:flex;align-items:center;gap:0.5rem;transition:transform 0.1s; }
    .repo-chip:hover { transform:translateY(-1px); }
    .repo-dot { width:8px;height:8px;border-radius:50%; }

    /* PRs Section */
    .section-title { font-size:1.25rem;font-weight:600;margin:2rem 0 1rem;display:flex;align-items:center;gap:0.5rem; }
    .prs { display:grid;gap:1rem;margin-bottom:3rem; }
    .pr-card { background:var(--surface);border:1px solid var(--border);border-radius:0.75rem;padding:1.25rem;display:grid;grid-template-columns:auto 1fr auto;gap:1rem;align-items:start; }
    .pr-state { width:12px;height:12px;border-radius:50%;margin-top:0.3rem; }
    .pr-state.open { background:#22C55E;box-shadow:0 0 8px rgba(34,197,94,0.4); }
    .pr-state.merged { background:#8B5CF6;box-shadow:0 0 8px rgba(139,92,246,0.4); }
    .pr-state.closed { background:#EF4444; }
    .pr-title { font-weight:600;margin-bottom:0.25rem; }
    .pr-meta { font-size:0.8rem;color:var(--muted);display:flex;flex-wrap:wrap;gap:0.75rem;align-items:center; }
    .pr-meta code { background:var(--bg);padding:0.1rem 0.4rem;border-radius:4px;font-size:0.75rem; }
    .pr-stats { text-align:right;font-family:'JetBrains Mono',monospace;font-size:0.8rem; }
    .pr-stats .added { color:var(--green); }
    .pr-stats .deleted { color:var(--red); }

    /* Timeline */
    .timeline { display:grid;grid-template-columns:90px 1fr;gap:0 2rem;width:100%; }
    .day-header { grid-column:1/-1;font-weight:600;color:var(--muted);font-size:0.85rem;text-transform:uppercase;letter-spacing:0.05em;margin:2rem 0 1rem;padding-bottom:0.5rem;border-bottom:1px dashed var(--border); }
    .time { text-align:right;font-family:'JetBrains Mono',monospace;font-size:0.8rem;color:var(--muted);padding-top:1rem; }
    .event { position:relative;padding-left:1.5rem;border-left:2px solid var(--border);padding-bottom:1rem; }
    .event-dot { position:absolute;left:-7px;top:1rem;width:12px;height:12px;border-radius:50%;background:var(--surface);border:3px solid currentColor; }
    .event-card { background:var(--surface);border:1px solid var(--border);border-radius:0.5rem;padding:0.75rem 1rem;transition:all 0.15s; }
    .event-card:hover { transform:translateX(4px);box-shadow:0 2px 8px rgba(0,0,0,0.05); }
    .event-header { display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;gap:1rem; }
    .event-repo { font-family:'JetBrains Mono',monospace;font-size:0.7rem;font-weight:600;text-transform:uppercase;letter-spacing:0.03em;white-space:nowrap; }
    .event-stats { font-family:'JetBrains Mono',monospace;font-size:0.7rem;display:flex;gap:0.5rem;white-space:nowrap; }
    .event-msg { font-weight:500;line-height:1.5; }
    .event-msg a { text-decoration:none; }
    .event-msg a:hover { text-decoration:underline; }
    .event-hash { font-family:'JetBrains Mono',monospace;font-size:0.7rem;color:var(--blue);background:rgba(59,130,246,0.1);padding:0.1rem 0.3rem;border-radius:3px;margin-left:0.5rem; }
    .event-summary { margin-top:0.5rem;font-size:0.75rem;color:var(--muted);font-family:'JetBrains Mono',monospace;font-style:italic; }
    .event-files { margin-top:0.75rem;padding-top:0.75rem;border-top:1px dashed var(--border);font-size:0.75rem;color:var(--muted);font-family:'JetBrains Mono',monospace;display:none; }
    .event-card:hover .event-summary { display:none; }
    .event-card:hover .event-files { display:block; }
    .file-line { display:flex;justify-content:space-between;align-items:center;margin-bottom:0.25rem;padding:0.25rem 0.5rem;background:var(--bg);border-radius:0.25rem; }
    .file-line:hover { background:var(--surface-hover); }
    .file-name { color:var(--text);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:0.75rem; }
    .file-stats { display:flex;gap:0.75rem;margin-left:1rem;flex-shrink:0; }
    .file-stats .added { color:var(--green);font-weight:600; }
    .file-stats .deleted { color:var(--red);font-weight:600; }

    /* On touch devices (no hover), show full file list */
    @media (hover: none) {
      .event-summary { display:none; }
      .event-files { display:block; }
    }

    /* Responsive */
    @media (max-width: 768px) {
      body { padding:1rem; }
      .header { flex-direction:column;gap:1rem; }
      h1 { font-size:1.75rem; }
      .stats-row { flex-wrap:wrap;gap:0.75rem; }
      .stat { min-width:70px;padding:0.75rem 1rem; }
      .stat-val { font-size:1.25rem; }
      .repos { padding:0.75rem; }
      .repo-chip { font-size:0.7rem;padding:0.2rem 0.5rem; }
      .pr-card { grid-template-columns:auto 1fr;gap:0.75rem; }
      .pr-stats { grid-column:2;text-align:left;margin-top:0.5rem; }
      .pr-meta { gap:0.5rem; }
      .timeline { grid-template-columns:60px 1fr;gap:0 1rem; }
      .time { font-size:0.7rem; }
      .event { padding-left:1rem; }
      .event-header { flex-direction:column;align-items:flex-start;gap:0.25rem; }
      .event-msg { font-size:0.9rem; }
    }
    @media (max-width: 480px) {
      body { padding:0.75rem; }
      h1 { font-size:1.5rem; }
      .stats-row { width:100%;justify-content:space-between; }
      .stat { flex:1;min-width:0;padding:0.5rem; }
      .stat-val { font-size:1rem; }
      .stat-label { font-size:0.65rem; }
      .timeline { grid-template-columns:50px 1fr;gap:0 0.5rem; }
      .event-card { padding:0.5rem 0.75rem; }
      .event-repo { font-size:0.6rem; }
      .event-stats { font-size:0.6rem; }
      .event-hash { font-size:0.6rem; }
    }
  </style>
</head>
<body>
<div class="container">
  <div class="header">
    <div>
      <h1>Activity Report</h1>
      <div class="subtitle">Last ${hoursBack / 24} days • ${
    data.stats.commits
  } commits • ${data.stats.prs} PRs</div>
    </div>
    <div class="stats-row">
      <div class="stat"><div class="stat-val">${
        data.stats.commits
      }</div><div class="stat-label">Commits</div></div>
      <div class="stat"><div class="stat-val added">+${(
        data.stats.additions / 1000
      ).toFixed(1)}k</div><div class="stat-label">Lines</div></div>
      <div class="stat"><div class="stat-val deleted">-${(
        data.stats.deletions / 1000
      ).toFixed(1)}k</div><div class="stat-label">Lines</div></div>
      <div class="stat"><div class="stat-val">${
        data.stats.prs
      }</div><div class="stat-label">PRs</div></div>
    </div>
  </div>

  <div class="repos">
    ${Object.entries(data.repos)
      .sort((a, b) => b[1].commits - a[1].commits)
      .map(
        ([name, r]) => `
      <a href="${r.remoteUrl || "#"}" target="_blank" class="repo-chip">
        <span class="repo-dot" style="background:${repoColors[name]}"></span>
        ${name} <span style="color:var(--muted)">${r.commits}</span>
      </a>
    `
      )
      .join("")}
  </div>

  ${
    data.prs.length
      ? `
  <div class="section-title">Pull Requests</div>
  <div class="prs">
    ${data.prs
      .map(
        (pr) => `
      <div class="pr-card">
        <div class="pr-state ${pr.state.toLowerCase()}"></div>
        <div>
          <a href="${pr.url}" target="_blank" class="pr-title">${pr.title}</a>
          <div class="pr-meta">
            <span>${pr.repo}</span>
            <code>${pr.headBranch} → ${pr.baseBranch}</code>
            <span>${pr.commits} commits</span>
            ${
              pr.mergeable === "MERGEABLE"
                ? '<span style="color:var(--green)">Mergeable</span>'
                : ""
            }
            ${
              pr.reviews.length
                ? `<span>${pr.reviews.length} reviews</span>`
                : ""
            }
          </div>
        </div>
        <div class="pr-stats">
          <div class="added">+${pr.stats.added.toLocaleString()}</div>
          <div class="deleted">-${pr.stats.deleted.toLocaleString()}</div>
          <div style="color:var(--muted)">${pr.stats.files} files</div>
        </div>
      </div>
    `
      )
      .join("")}
  </div>
  `
      : ""
  }

  <div class="section-title">Commit Timeline</div>
  <div class="timeline">
    ${renderTimeline(data.commits, repoColors)}
  </div>
</div>
</body>
</html>`;

  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, html);
  console.log(`Generated ${outputFile}`);
}

function renderTimeline(events, colors) {
  let lastDay = null;
  return events
    .map((e) => {
      const d = new Date(e.date);
      const day = d.toLocaleDateString(undefined, {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
      const time = d.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      });
      const color = colors[e.repo] || "#94A3B8";
      const commitUrl = e.remoteUrl ? `${e.remoteUrl}/commit/${e.hash}` : "#";

      let html = "";
      if (day !== lastDay) {
        html += `<div class="day-header">${day}</div>`;
        lastDay = day;
      }

      // Generate file summary (default view)
      let summaryHtml = "";
      let detailedFilesHtml = "";

      if (e.files?.length) {
        // Summary: "3 files: config, tools, services"
        const fileNames = e.files.slice(0, 3).map((f) => {
          const parts = f.file.split("/");
          return parts[parts.length - 1]; // Just the filename
        });
        const summary = `${e.files.length} file${
          e.files.length > 1 ? "s" : ""
        }: ${fileNames.join(", ")}${e.files.length > 3 ? " +more" : ""}`;
        summaryHtml = `<div class="event-summary">${summary}</div>`;

        // Detailed list with per-file stats
        detailedFilesHtml = '<div class="event-files">';
        e.files.forEach((f) => {
          detailedFilesHtml += `
          <div class="file-line">
            <span class="file-name">${f.file}</span>
            <div class="file-stats">
              ${f.added > 0 ? `<span class="added">+${f.added}</span>` : ""}
              ${
                f.deleted > 0
                  ? `<span class="deleted">-${f.deleted}</span>`
                  : ""
              }
            </div>
          </div>
        `;
        });
        detailedFilesHtml += "</div>";
      }

      html += `
      <div class="time">${time}</div>
      <div class="event" style="border-left-color:${color}40">
        <div class="event-dot" style="color:${color}"></div>
        <div class="event-card">
          <div class="event-header">
            <span class="event-repo" style="color:${color}">${e.repo}${
        e.prNumber ? ` #${e.prNumber}` : ""
      }</span>
            <div class="event-stats"><span class="added">+${
              e.stats?.added || 0
            }</span><span class="deleted">-${e.stats?.deleted || 0}</span></div>
          </div>
          <div class="event-msg">
            <a href="${commitUrl}" target="_blank">${
        e.headline
      }</a><a href="${commitUrl}" target="_blank" class="event-hash">${
        e.shortHash
      }</a>
          </div>
          ${summaryHtml}
          ${detailedFilesHtml}
        </div>
      </div>
    `;
      return html;
    })
    .join("");
}

main().catch(console.error);
