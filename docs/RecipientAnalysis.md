# Recipient Analysis

## Overview

The Recipient Analysis page provides an FSC Leaderboard view, ranking the top recipients by dollar value across each Federal Supply Class (FSC) category. It enables users to quickly identify which companies dominate specific supply categories and where Deval Corporation stands within each FSC.

**Route:** `/recipient-analysis`

## Features

### Search & Filter

- **Real-time search** — Filter FSC cards by code or description (case-insensitive)
- **Fiscal Year selector** — Toggle between FY2023, FY2024, FY2025, and FY2026 (defaults to FY2026)
- **Result count** — Displays how many FSC categories match the current filter

### Sorting

Three sort modes available via toggle buttons:

| Mode | Behavior |
|------|----------|
| **Volume** | Sort by total FSC dollar volume, highest first (default) |
| **FSC Code** | Sort alphabetically by 4-digit FSC code |
| **A → Z** | Sort alphabetically by FSC description |

### FSC Category Cards

Each card represents one FSC and displays:

- **Header** — FSC code, description, and total volume (color-coded by tier)
- **Recipient table** — Scrollable table of top 13 recipients per FSC

Table columns:

| Column | Description |
|--------|-------------|
| **#** | Rank within the FSC |
| **Company** | Recipient name (truncated with tooltip) |
| **Amount** | Total awarded value (formatted: $1.2B, $50.0M, $200K) |
| **Ct** | Number of individual awards |

### Deval Highlighting

- If Deval appears in a FSC's top recipients, its row is highlighted with a primary background
- If Deval is **not** in the top recipients, a separator (`...`) and a calculated Deval row are appended showing an estimated rank (26-100), award amount (0.2-1% of FSC volume), and award count (1-6)

### Navigation

Clicking any recipient row navigates to the Awards page filtered by that company:
```
/awards?recipient={companyName}
```

## Tier Color System

Cards are color-coded using 13 tiers based on volume ranking. FSC categories are sorted by total volume, grouped into batches of 4, and each group cycles through the tier palette:

| Tier | Color |
|------|-------|
| 1 | Red |
| 2 | Orange |
| 3 | Yellow |
| 4 | Green |
| 5 | Teal |
| 6 | Blue |
| 7 | Indigo |
| 8 | Purple |
| 9 | Pink |
| 10 | Brown |
| 11 | Dark |
| 12 | Grey |
| 13 | Mint |

Tier colors are defined as CSS custom properties (`--tier-1` through `--tier-13`) in `src/index.css` with both light and dark mode variants.

## Data Model

```typescript
interface Recipient {
  rank: number;
  name: string;
  total_awarded: number;
  award_count: number;
}

interface FSCEntry {
  fsc_code: string;        // e.g. "1560"
  fsc_description: string; // e.g. "Airframe Structural Components"
  total_volume: number;    // Total dollar volume for the FSC
  top_recipients: Recipient[];
}
```

## Data Source

Currently uses static mock data from `src/data/mockFscLeaderboard.json`. A Supabase integration is available in `src/lib/supabaseRecipientData.ts` (`fetchAllRecipientsWithFSC`) but is not yet wired into the component.

## Layout

Responsive CSS Grid:

| Breakpoint | Columns |
|------------|---------|
| Default | 1 |
| `sm` (640px) | 2 |
| `lg` (1024px) | 3 |
| `xl` (1280px) | 4 |

## Key Files

| File | Purpose |
|------|---------|
| `src/pages/RecipientAnalysis.tsx` | Main page component |
| `src/data/mockFscLeaderboard.json` | Mock FSC leaderboard data |
| `src/lib/supabaseRecipientData.ts` | Supabase data fetcher (unused) |
| `src/index.css` | Tier color CSS variables |
| `src/App.tsx` | Route definition |
| `src/components/AppSidebar.tsx` | Sidebar navigation entry |

## Dependencies

- **react-router-dom** — Navigation and routing
- **lucide-react** — Icons (Search, TrendingUp, Hash, SortAsc, Calendar)
- **Shadcn/ui** — Card, Table, Input, ScrollArea components
