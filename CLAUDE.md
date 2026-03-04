# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Developer activity transparency dashboard that scans local git repositories and displays commit/PR activity. Can be hosted locally, on GitHub Pages, or Cloudflare Pages.

## Commands

```bash
# Generate report (scans ~/Projects and ~/Local Sites by default)
npm run generate

# Use cached data for faster re-renders
npm run generate:cached

# Serve locally
npm start

# Run smoke test (generates into temp dir, cleans up)
npm test
```

### Generator CLI Options

```bash
node generate-rich-report.mjs \
  --paths ~/Projects,~/code \    # Comma-separated scan roots
  --hours 48 \                   # Time window (default: 168 = 7 days)
  --max-depth 4 \                # Repo scan depth
  --author you@example.com \     # Filter commits by email
  --gh-author someuser \         # GitHub PR author filter
  --exclude "vendor,archive" \   # Exclude repos matching patterns
  --no-prs                       # Skip PR fetching (no gh CLI needed)
```

Settings can also be persisted in `config.json` (see `config.json.example`).

Environment variables: `ACTIVITY_REPORT_AUTHOR_EMAIL`, `ACTIVITY_REPORT_GH_AUTHOR`, `GH_TOKEN`

## Architecture

**Data Flow:**
1. `generate-rich-report.mjs` recursively scans repo roots for `.git` directories
2. Extracts commits using `git log` with author filtering
3. Optionally fetches PRs via `gh` CLI (requires authentication)
4. Loads categories from `categories.json` / `CATEGORIES_CONFIG` env / `config.json`
5. Outputs `activity-data.json` with embedded categories (self-contained)
6. `index.html` reads categories from the data file (falls back to separate `categories.json`)

**Key Files:**
- `generate-rich-report.mjs` - Node.js generator script (ES modules), reads `config.json` for defaults
- `index.html` - Static dashboard with vanilla JS, loads data at runtime
- `activity-data.json` - Generated cache file (gitignored, created by generator)
- `categories.json` - Optional repo grouping config (gitignored, user-created from example)
- `.github/workflows/daily-update.yml` - Self-hosted runner workflow (Cloudflare deploy)
- `.github/workflows/github-pages.yml` - GitHub Pages workflow (GitHub-hosted runner)

**Repo Exclusions:**
Configured via `--exclude` flag or `config.json` `exclude` array. No hardcoded exclusions.

**Category Configuration:**
Categories are resolved at generation time and embedded in `activity-data.json`. Priority order:
1. `categories.json` file (standalone, gitignored)
2. `CATEGORIES_CONFIG` environment variable (JSON string, used in CI)
3. `categories` key in `config.json` (inline)

The frontend reads embedded categories from the data. Falls back to fetching `categories.json` separately for backward compat. See `categories.json.example` for the format.

## Deployment

Three options:
- **Local:** `npm run generate && npm start`
- **GitHub Pages:** Enable the `github-pages.yml` workflow
- **Cloudflare Pages:** Self-hosted runner + `daily-update.yml` workflow with repo variables
