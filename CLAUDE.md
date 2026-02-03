# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Developer activity transparency dashboard that scans local git repositories and displays commit/PR activity. Deployed to Cloudflare Pages at https://activity.drunk.support.

## Commands

```bash
# Generate report (scans ~/Projects and ~/Local Sites by default)
npm run generate

# Use cached data for faster re-renders
npm run generate:cached

# Run smoke test (generates into temp dir, cleans up)
npm test

# Deploy to Cloudflare Pages
npx wrangler pages deploy . --project-name=activity-report
```

### Generator CLI Options

```bash
node generate-rich-report.mjs \
  --paths ~/Projects,~/code \    # Comma-separated scan roots
  --hours 48 \                   # Time window (default: 168 = 7 days)
  --max-depth 4 \                # Repo scan depth
  --author you@example.com \     # Filter commits by email
  --gh-author someuser \         # GitHub PR author filter
  --no-prs                       # Skip PR fetching (no gh CLI needed)
```

Environment variables: `ACTIVITY_REPORT_AUTHOR_EMAIL`, `ACTIVITY_REPORT_GH_AUTHOR`, `GH_TOKEN`

## Architecture

**Data Flow:**
1. `generate-rich-report.mjs` recursively scans repo roots for `.git` directories
2. Extracts commits using `git log` with author filtering
3. Optionally fetches PRs via `gh` CLI (requires authentication)
4. Outputs `activity-data.json` (cached data) and `index.html` (static dashboard)

**Key Files:**
- `generate-rich-report.mjs` - Node.js generator script (ES modules)
- `index.html` - Static dashboard with vanilla JS, loads `activity-data.json` at runtime
- `activity-data.json` - Generated cache file containing commits, PRs, and stats
- `.github/workflows/daily-update.yml` - Runs on self-hosted Mac runner at 9 AM UTC

**Repo Exclusions:**
The generator excludes repos matching patterns in `EXCLUDE_PATTERNS` (wp-fusion, dana).

**Category Configuration:**
The dashboard categorizes repos in `CATEGORY_CONFIG` (index.html:995). Add new repos to appropriate categories for proper grouping.

## Deployment

- **Platform:** Cloudflare Pages
- **Daily Updates:** Self-hosted GitHub Actions runner on local Mac
- **Required Secrets:** `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
