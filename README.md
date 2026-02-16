# Activity Report

Developer activity transparency report (defaults to last 7 days).

**Live at:** https://pulse.automem.ai/

## What's Included

- Commit history from local git repos (last 7 days by default)
- Optional: PRs + review status via GitHub CLI (`gh`)
- File changes with lines added/removed
- Timeline visualization

## Local Development

### Prerequisites

- Node.js (v18+ recommended)
- `git`
- Optional: `gh` (GitHub CLI) for PR details (`brew install gh`)

### Quickstart (local)

Generate the report (scans default roots `~/Projects` and `~/Local Sites`):

```bash
node generate-rich-report.mjs
```

Open the output:

- macOS: `open index.html`
- Any OS: `python3 -m http.server 8080` then visit `http://localhost:8080`

Run the smoke test (generates into a temp dir and cleans up; doesn’t touch your repo):

```bash
npm test
```

Use cached data for faster re-renders (skips scanning local repos):

```bash
node generate-rich-report.mjs --cached
```

### Make it portable (recommended)

By default, the generator scans `~/Projects` and `~/Local Sites` and filters commits by your git email.
For someone cloning this repo, these flags/env vars make it work in any environment:

- Set the author email (commit filter):
  - `ACTIVITY_REPORT_AUTHOR_EMAIL="you@example.com"`
  - or pass `--author you@example.com`
- Limit scan roots: `--paths ~/Projects,~/code` (comma-separated)
- Change time window: `--hours 48` (default: `168` / 7 days)
- Control repo scan depth: `--max-depth 4` (default: `4`)
- Skip PR fetching (no `gh` needed): `--no-prs`

Example (works on GitHub-hosted runners too; only scans this repo):

```bash
ACTIVITY_REPORT_AUTHOR_EMAIL="you@example.com" node generate-rich-report.mjs --paths . --hours 48 --no-prs
```

### PR fetching (optional)

If you want PRs included:

- Authenticate `gh` (`gh auth login`) or set `GH_TOKEN` in your environment.
- By default it searches PRs authored by `@me`. Override with:
  - `ACTIVITY_REPORT_GH_AUTHOR="someuser"` or `--gh-author someuser`

## Automated Updates

This repo uses GitHub Actions with a self-hosted runner for daily updates.
The runner runs on the local Mac to access local git repositories.

Schedule: Daily at 9 AM UTC (via `.github/workflows/daily-update.yml`)

### Setting Up the Runner

1. Go to GitHub repo → Settings → Actions → Runners → New self-hosted runner
2. Follow macOS setup instructions
3. Install as a service: `./svc.sh install && ./svc.sh start`

### Required Secrets

- `CLOUDFLARE_API_TOKEN`: For wrangler deploy
- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID

## Manual Deploy

Set Cloudflare env vars (or configure wrangler auth), then run:

```bash
export CLOUDFLARE_ACCOUNT_ID="..."
export CLOUDFLARE_API_TOKEN="..."
./deploy.sh
```

Or via wrangler directly:

```bash
npx wrangler pages deploy . --project-name=activity-report
```

## Structure

```
activity-report/
├── .github/
│   └── workflows/
│       └── daily-update.yml   # GitHub Actions workflow
├── generate-rich-report.mjs   # Report generator
├── index.html                 # The report (generated)
├── activity-data.json         # Raw data (generated)
├── wrangler.toml              # Cloudflare Pages config
├── deploy.sh                  # Deploy script
├── package.json
└── README.md
```

## Cloudflare Pages

- **Project:** activity-report
- **Domain:** activity.drunk.support
