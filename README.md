# Activity Report

A developer activity dashboard that scans your local git repos and displays commits, PRs, and stats as a static site. Run it locally, deploy to GitHub Pages, or host on Cloudflare Pages.

Preview: [https://pulse.automem.ai](https://pulse.automem.ai)

## Quick Start

```bash
# Generate the report (scans ~/Projects and ~/Local Sites by default)
node generate-rich-report.mjs --paths ~/Projects --no-prs

# View it
npx http-server -p 8080
# Open http://localhost:8080
```

That's it. You should see your commit activity for the last 7 days.

## Prerequisites

- **Node.js** v18+
- **git**
- Optional: [GitHub CLI](https://cli.github.com/) (`gh`) for PR details

## Configuration

### CLI Flags

```bash
node generate-rich-report.mjs \
  --paths ~/Projects,~/code \    # Comma-separated scan roots
  --hours 48 \                   # Time window (default: 168 = 7 days)
  --max-depth 4 \                # Repo scan depth
  --author you@example.com,work@example.com \  # Filter commits by email (comma-separated)
  --gh-author someuser \         # GitHub PR author filter
  --exclude "vendor,archive" \   # Exclude repos matching patterns
  --no-prs                       # Skip PR fetching (no gh CLI needed)
```

### config.json (Optional)

Create a `config.json` in the repo root for persistent settings (see [config.json.example](config.json.example)):

```json
{
  "paths": ["~/Projects", "~/code"],
  "author": "you@example.com,work@example.com",
  "ghAuthor": "your-github-username",
  "exclude": ["node_modules", "vendor"],
  "hours": 168
}
```

CLI flags override config.json values.

### Environment Variables

These also work as alternatives to CLI flags:

- `ACTIVITY_REPORT_AUTHOR_EMAIL` — commit author filter (comma-separated for multiple emails)
- `ACTIVITY_REPORT_GH_AUTHOR` — GitHub PR author filter
- `GH_TOKEN` — GitHub token for PR fetching

If no author is specified, it falls back to your `git config user.email`. Multiple emails are OR'd (`git log --author=a --author=b`).

### Categories (Optional)

Group repos into named categories in the Project Breakdown section. Categories are resolved at generation time and embedded in `activity-data.json`, so they persist through deploys without needing a separate file at runtime.

Three ways to configure (checked in this order):

1. **`categories.json` file** — standalone file in repo root (gitignored, see [categories.json.example](categories.json.example))
2. **`CATEGORIES_CONFIG` env var** — JSON string, useful in CI (set as a repo variable for the workflow)
3. **`categories` key in `config.json`** — inline in your config (see [config.json.example](config.json.example))

```json
{
  "Frontend": { "icon": "🖥️", "class": "frontend", "repos": ["my-app", "website"] },
  "Backend": { "icon": "⚙️", "class": "backend", "repos": ["api", "worker"] }
}
```

Repos not in any category appear in an "Other" group. If no categories are configured, all repos are shown ungrouped.

### PR Fetching

If you want PRs included in the report:

1. Install [GitHub CLI](https://cli.github.com/): `brew install gh`
2. Authenticate: `gh auth login` (or set `GH_TOKEN`)
3. Run without `--no-prs`

By default it searches PRs authored by `@me`. Override with `--gh-author yourname`.

## Hosting Options

### Local Only

```bash
npm run generate     # Generate the report
npm start            # Serve at http://localhost:8080
```

Use `npm run generate:cached` for faster re-renders from cached data.

### GitHub Pages (Free)

The included `.github/workflows/github-pages.yml` workflow deploys to GitHub Pages. It runs on GitHub-hosted runners (no self-hosted runner needed), but can only scan commits in the repo itself.

1. Go to repo **Settings > Pages > Source: GitHub Actions**
2. Run the workflow manually (Actions > Activity Report (GitHub Pages) > Run workflow)
3. To automate: uncomment the `schedule` trigger in the workflow file

### Cloudflare Pages (with Self-Hosted Runner)

For scanning local repos on your machine, use `.github/workflows/daily-update.yml` with a self-hosted runner.

1. Set up a [self-hosted runner](https://docs.github.com/en/actions/hosting-your-own-runners) on your machine
2. Configure repository variables (Settings > Variables):
   - `SCAN_PATHS` — paths to scan (e.g. `~/Projects,~/code`)
   - `GH_AUTHOR` — your GitHub username
   - `AUTHOR_EMAILS` — comma-separated git author emails to include in the report
   - `GIT_EMAIL` — email for the bot commit that pushes `activity-data.json`
   - `GIT_NAME` — name for automated commits
   - `SITE_CONFIG` — dashboard branding JSON (`title`, `tagline`, `accentColor`, `timezone`)
   - `CLOUDFLARE_DEPLOY` — set to `true` to enable Cloudflare deployment
   - `CLOUDFLARE_PROJECT` — Cloudflare Pages project name
3. Add secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`

## How It Works

1. `generate-rich-report.mjs` recursively scans directories for `.git` repos
2. Extracts commits via `git log` with author filtering
3. Optionally fetches PR details via `gh` CLI
4. Loads categories config (if any) and embeds them in the output
5. Outputs `activity-data.json` (self-contained: data + categories)
6. `index.html` loads `activity-data.json` at runtime — it's a static vanilla JS dashboard, no build step

## Scripts

```bash
npm run generate         # Generate fresh report
npm run generate:cached  # Use cached activity-data.json
npm start                # Serve locally on port 8080
npm test                 # Smoke test (generates into temp dir, cleans up)
```

## License

MIT
