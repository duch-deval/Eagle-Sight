# Eagle-Sight Architecture

Defense contracting analytics platform for visualizing government procurement data, weapon platform sustainment networks, and budget breakdowns. Built with React + TypeScript, backed by Supabase (PostgreSQL), and deployed to GitHub Pages.

---

## Folder Structure

```
src/
├── components/
│   ├── dashboard/          # Domain-specific data visualizations
│   │   ├── AgencySpendingChart.tsx   # Classified program spending metrics
│   │   ├── BudgetAnalysis.tsx        # FY25 vs FY26 winner/loser comparison
│   │   ├── DefenseBudgetBreakdown.tsx # Hierarchical budget browser (Procurement/RDT&E/O&M)
│   │   ├── DepotMap.tsx              # Interactive US map of depot locations
│   │   ├── EntityCard.tsx            # Generic org/contractor card
│   │   ├── FundingChart.tsx          # Stacked bar chart by FSC code
│   │   ├── PlatformNews.tsx          # News feed via Supabase edge function
│   │   ├── TreemapChart.tsx          # Drillable award treemap (Office→Year→FSC→Recipient→Award)
│   │   └── WeaponPlatformCard.tsx    # Platform summary card with image
│   ├── ui/                 # shadcn/ui primitives + custom components
│   │   ├── TacticalComponents.tsx    # Corporate design system (CorporateButton, CorporateCard, etc.)
│   │   ├── sidebar.tsx               # Collapsible sidebar primitives
│   │   └── ...                       # ~40 Radix-based shadcn/ui components
│   ├── AppSidebar.tsx      # Main navigation sidebar
│   ├── AwardTable.tsx      # Sortable/filterable awards table with PoP status
│   └── ThemeToggle.tsx     # Dark/light mode switch
├── data/
│   └── weaponsPlatforms.ts # TypeScript interfaces + deprecated static data stubs
├── hooks/
│   ├── usePlatforms.ts     # Supabase queries for platforms, depots, contacts
│   ├── use-toast.ts        # Toast notification state
│   └── use-mobile.tsx      # Viewport breakpoint detection
├── lib/
│   ├── supabaseClient.ts   # Supabase client init (env vars)
│   ├── supabaseData.ts     # Paginated award fetchers by office
│   ├── loadCsv.ts          # PapaParse CSV loader (legacy)
│   └── utils.ts            # cn() class merge utility
├── pages/
│   ├── Homepage.tsx         # Budget analysis dashboard
│   ├── AwardSearch.tsx      # Award search with treemap + funding charts
│   ├── AwardWatchlist.tsx   # Profile-based award watchlist management
│   ├── WeaponsPlatforms.tsx # Platform grid/list with depot map
│   ├── WeaponPlatformDetail.tsx # Platform detail (specs, sustainment, budget, news)
│   ├── PointsOfContact.tsx  # Paginated contact directory
│   ├── ContactDetail.tsx    # Contact profile with award activity timeline
│   ├── DepotDetail.tsx      # Depot detail with linked platforms
│   ├── ExportData.tsx       # Bulk data export with PSC/FSC filtering
│   └── NotFound.tsx         # 404 page
├── App.tsx                  # Router + layout (SidebarProvider + QueryClientProvider)
├── App.css                  # Root element styles
├── index.css                # CSS custom properties, theme tokens, utility classes
└── main.tsx                 # React entry point
```

---

## Key Components and Responsibilities

### Pages

| Page | Purpose |
|------|---------|
| **Homepage** | Tabs showing agency spending, defense budget breakdown, and budget winner/loser analysis |
| **AwardSearch** | Funding charts + interactive treemap for exploring awards by office, year, FSC, and recipient |
| **AwardWatchlist** | Create profiles and save awards to them; sortable table with PoP color coding |
| **WeaponsPlatforms** | Filterable grid of platforms with an interactive depot map overlay |
| **WeaponPlatformDetail** | Tabbed detail view: overview, specifications, sustainment depots, budget, and news |
| **PointsOfContact** | Paginated directory of contracting personnel with search (from `contact_summary` view) |
| **ContactDetail** | Individual contact with role-based award activity stream grouped by time |
| **DepotDetail** | Sustainment node with supported platforms, contracting offices, and PMAs |
| **ExportData** | Filtered bulk export to CSV with fiscal year presets and cursor-based pagination |

### Dashboard Components

| Component | Responsibility |
|-----------|---------------|
| **DefenseBudgetBreakdown** | Expandable tree: Account > Budget Activity > BLI, with FY comparison and agency filtering |
| **TreemapChart** | 5-level drillable treemap (Office > Year > FSC > Recipient > Award) with set-aside pie chart |
| **FundingChart** | Stacked bar chart by FSC code, supports fiscal year or monthly aggregation |
| **AgencySpendingChart** | Classified program spending from budget CSV data |
| **BudgetAnalysis** | Top 10 increases/decreases by agency comparing FY25 vs FY26 |
| **DepotMap** | react-simple-maps US map with pulsing markers for depot locations |
| **PlatformNews** | News articles via Supabase edge function with relevance scoring and 24h cache |
| **AwardTable** | Reusable sortable table with search, set-aside filter, and PoP status color bars |

### Custom Design System (`TacticalComponents.tsx`)

| Component | Description |
|-----------|-------------|
| **CorporateButton** | 4 variants (primary/secondary/outline/link), 3 sizes, optional arrow icon |
| **CorporateInput** | Text input with uppercase label and optional icon |
| **CorporateSelect** | Dropdown with custom chevron and label styling |
| **CorporateCard** | Container with hover border/shadow transitions |
| **SectionHeader** | Section title with optional subtitle and HR decoration |

---

## Data Flow

```
Supabase (PostgreSQL)
    │
    ├── lib/supabaseClient.ts          ← Single client instance (env vars)
    ├── lib/supabaseData.ts            ← Paginated award fetchers
    │
    ▼
Custom Hooks (src/hooks/)
    │
    ├── usePlatforms()                 ← platforms table → WeaponPlatform[]
    ├── usePlatformById(id)            ← platforms + platform_depot_links + platform_contacts
    ├── useAllDepots()                 ← platform_depot_links (joined) → DepotWithPlatform[]
    ├── useDepotById(id)               ← depots + platform_depot_links (joined) → DepotDetail
    │
    ▼
Page Components (src/pages/)
    │
    ├── Local state (useState)          ← Filters, search, tabs, pagination
    ├── Computed state (useMemo)        ← Filtered/sorted/aggregated data
    │
    ▼
Dashboard Components (src/components/dashboard/)
    │
    └── Rendered UI with Recharts, react-simple-maps, shadcn/ui
```

### Supabase Tables

| Table | Purpose |
|-------|---------|
| `platforms` | Weapon systems (name, category, status, service, `display_data` JSONB) |
| `depots` | Sustainment facilities (name, base, lat/lon) |
| `platform_depot_links` | Many-to-many with roles, pma_code, contracting_offices |
| `platform_contacts` | Key contacts per platform (name, title, org, email, phone) |
| `awards` | Contract awards (award_id, recipient, amount, FSC, dates, personnel) |
| `profiles` | User-created watchlist profiles |
| `watchlist_awards` | Awards saved to profiles (profile_id, award_db_id) |
| `contact_summary` | Aggregated view: email, roles[], total_awards, funding_offices[] |
| `prepared_user_contacts` | Junction table linking preparers to awards |
| `approved_by_contacts` | Junction table linking approvers to awards |
| `last_modified_by_contacts` | Junction table linking modifiers to awards |

### Supabase Edge Functions

| Function | Purpose |
|----------|---------|
| `get-news` | Fetches platform-relevant news articles (called by PlatformNews component) |

---

## Routing Structure

**Router:** React Router DOM v6 with `BrowserRouter` (base path `/Eagle-Sight/` in production)

```
/                           → Homepage
/awards                     → AwardSearch
/AwardWatchlist             → AwardWatchlist
/platforms                  → WeaponsPlatforms
/platforms/:id              → WeaponPlatformDetail
/depots/:id                 → DepotDetail
/points-of-contact          → PointsOfContact
/points-of-contact/:email   → ContactDetail
/contacts/:email            → ContactDetail (alternate route)
/export                     → ExportData
*                           → NotFound
```

**Layout:** All routes are wrapped in `SidebarProvider` > `AppSidebar` + main content area with `SidebarTrigger` and `ThemeToggle` in the header.

---

## State Management

### No global store. State lives in three places:

**1. Server state (Supabase via hooks)**
- Custom hooks (`usePlatforms`, `usePlatformById`, `useAllDepots`, `useDepotById`) manage their own `loading`, `error`, and `data` state
- Hooks use `useState` + `useEffect` with parallel `Promise.all()` for related queries
- `QueryClientProvider` (TanStack React Query) wraps the app but is currently underutilized; hooks fetch manually

**2. Local component state (useState)**
- Search terms, active filters, selected tabs, pagination, sort config, modal open/close
- Each page is self-contained; no state shared between pages

**3. URL state (React Router)**
- `useParams()` for entity IDs and email addresses (`/platforms/:id`, `/points-of-contact/:email`)
- `useLocation()` for active route highlighting in sidebar
- Enables deep linking and browser navigation

### Other patterns
- **useMemo** for expensive client-side filtering, sorting, and aggregation
- **Toast state** uses a module-level pub-sub pattern (not React context)
- **Sidebar state** managed by shadcn/ui `SidebarProvider` context
- **Theme state** persisted in localStorage, toggled via `.dark` class on `<html>`

---

## External Dependencies

### Runtime

| Dependency | Purpose |
|------------|---------|
| `@supabase/supabase-js` | Database client (env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) |
| `@tanstack/react-query` | Server state caching (wraps app, hooks not yet migrated to `useQuery`) |
| `recharts` | Charts: treemap, bar, pie, area |
| `react-simple-maps` | US map with Albers USA projection |
| `react-router-dom` | Client-side routing |
| `@radix-ui/*` | Accessible UI primitives (40+ packages, via shadcn/ui) |
| `lucide-react` | Icon library |
| `next-themes` | Theme provider |
| `papaparse` | CSV parsing (legacy, used by `loadCsv.ts`) |
| `xlsx` | Excel export |
| `date-fns` | Date formatting |
| `emailjs-com` | Email integration |
| `zod` + `react-hook-form` | Form validation |

### Build

| Tool | Purpose |
|------|---------|
| Vite + `@vitejs/plugin-react-swc` | Build tooling with SWC compiler |
| TypeScript 5.8 | Type checking (relaxed strictness: `strict: false`, `noImplicitAny: false`) |
| Tailwind CSS 3.4 + `tailwindcss-animate` | Utility-first styling |
| `gh-pages` | GitHub Pages deployment |

---

## Design System

### CSS Custom Properties (index.css)

All colors use HSL format and are consumed via `hsl(var(--token))` in Tailwind config.

**Corporate palette:**
- `--corporate-navy: 222 47% 11%` (sidebar, hero banners, headings)
- `--corporate-blue: 217 91% 60%` (accent, active states, links)
- `--navy` / `--navy-light` / `--navy-dark` (scale for depth)

**Semantic tokens:** `--primary`, `--secondary`, `--destructive`, `--muted`, `--accent`, `--success`, `--warning`, `--info`

**Shadows:** `--shadow-soft`, `--shadow-medium`, `--shadow-strong` (navy-tinted)

**Gradients:** `--gradient-navy` (135deg navy blend), `--gradient-subtle` (white to off-white)

**Dark mode:** `.dark` class swaps all tokens. Corporate colors stay consistent; backgrounds shift to `240 6% 10%`.

### Tailwind Extensions (tailwind.config.ts)

- All CSS custom properties mapped as Tailwind colors (e.g., `bg-corporate-navy`, `text-primary`)
- Sidebar-specific color scale (8 tokens)
- Container: centered, max 1400px at 2xl
- Border radius: `lg`/`md`/`sm` derived from `--radius: 0.5rem`

### Visual Language

- Sharp corners (`rounded-sm`) for a tactical/military aesthetic
- Uppercase bold tracking-wide labels on section headers and form labels
- Status color coding for Period of Performance: red (1-14 days), orange (15-29), yellow (30-44), blue (45-60), green (>60), grey (ended)
- Responsive chart containers: 300px mobile, 500px tablet, 700px desktop

### Component Layering

1. **Radix UI** — Accessible primitives (focus management, keyboard nav, ARIA)
2. **shadcn/ui** — Styled wrappers around Radix (~40 components in `ui/`)
3. **TacticalComponents** — Corporate-branded variants (CorporateButton, CorporateCard, SectionHeader)
4. **Dashboard components** — Domain-specific compositions using all three layers
