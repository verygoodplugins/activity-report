# Dev Pulse Activity Dashboard

## Overview
An interactive developer activity dashboard built with React + Vite, featuring the AutoMem brand aesthetic. Displays weekly/monthly developer activity, repository stats, and pull requests with playful animations. Designed as a gift to the $automem community - easily deployable to Cloudflare Pages.

## Tech Stack
- **Framework**: React 18 + TypeScript + React Router
- **Build Tool**: Vite 7
- **Animation**: Framer Motion (with reduced motion support)
- **Fonts**: JetBrains Mono, IBM Plex Mono

## Project Structure
```
devpulse/
├── src/
│   ├── components/
│   │   ├── Cards/         # StatCard, DayCard, RepoCard, PRCard, DayDetailModal, MonthView
│   │   ├── Effects/       # SpringNumber, Particles
│   │   ├── Jack/          # Jack character SVG with animations
│   │   └── Layout/        # Header, HexSidebar
│   ├── hooks/             # useActivityData, useConfig, useTheme, useReducedMotion
│   ├── pages/             # SetupPage (deployment instructions)
│   ├── styles/            # Design tokens
│   ├── types/             # TypeScript types
│   └── data/
│       ├── activity-data.json    # Activity data
│       ├── config.json           # Dashboard configuration
│       └── themes/               # Theme packs
├── scripts/
│   ├── generate-data.ts   # GitHub data generator (Octokit)
│   └── package.json
├── public/                # Static assets
└── vite.config.ts         # Vite configuration
```

## Brand Colors (Default Theme)
- **Primary Gold**: `#F9D857`
- **Secondary Gold**: `#D4A425`
- **Pink Accent**: `#F472B6`
- **Background Dark**: `#0A0A0A`
- **Surface Elevated**: `#141414`

## Key Features
- **Hex sidebar navigation** with memory addresses (0x0000, 0x0010, etc.)
- **Settings Panel** - gear button in bottom-right opens panel to switch themes and toggle features live
- **Day Detail Modal** - click any day to see commits, files changed, repos touched
- **Week/Month toggle** - switch between weekly cards and monthly calendar heatmap
- **Enhanced Repo Cards** - description, stars, language badge with color, topics as pills
- **Enhanced PR Cards** - description preview, review status, comments count, CI status badges
- **JSON Config System** - sections, colors, and interactivity configurable via config.json
- **Theme Packs** - 3 themes: terminal-dark, cream-light, neon-cyberpunk
- **Setup Page** (/setup) - deployment instructions for Cloudflare Pages
- **JackHead mascot** - Bigger head-only design with nodding/blinking animations
- **Reduced motion support** - respects prefers-reduced-motion
- **Responsive design** for mobile

## Routes
- `/` - Main dashboard
- `/setup` - Setup guide and deployment instructions

## Configuration
Edit `src/data/config.json` to customize:
- Enable/disable sections (hero, weekly, repos, prs)
- Custom titles and subtitles
- Theme colors (primary, secondary, background, etc.)
- Interactivity settings (animations, dayDetailModal, monthView)
- Branding and attribution

### Theme Packs
Swap themes via the Settings Panel (gear icon) - each theme includes unique colors AND fonts:
- `themes/terminal-dark.json` - Default gold/dark terminal aesthetic (JetBrains Mono)
- `themes/minimal-light.json` - Warm cream/gold light theme, automem.ai style (IBM Plex Mono)
- `themes/neon-cyberpunk.json` - Vibrant cyan/magenta cyberpunk (Orbitron + Share Tech Mono)
- `themes/corporate-pro.json` - Professional blue/white corporate theme (Inter)
- `themes/retro-arcade.json` - Pixelated green-on-black arcade style (VT323)

## Running Locally
```bash
cd devpulse
npm install
npm run dev
```

## Generating Activity Data
```bash
cd devpulse/scripts
npm install
npm run generate
```
Requires GitHub token (via Replit connector or GITHUB_TOKEN env var).

## Deployment to Cloudflare Pages
1. Fork the repository
2. Create a GitHub Personal Access Token
3. Configure config.json with your preferences
4. Deploy to Cloudflare Pages
5. Set up GitHub Actions for daily updates

See `/setup` page for detailed instructions.

## Attribution
made with 💛 by autojack for the $automem community
