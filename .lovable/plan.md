
# Eagle-Sight: Build Fix + UI Polish Plan

## Step 0: Fix All Build Errors (8 fixes, 5 files)

These are surgical, minimal fixes to get the app compiling:

| # | File | Line(s) | Error | Fix |
|---|------|---------|-------|-----|
| 1 | `src/components/dashboard/FundingChart.tsx` | 79 | `fetchFundingByOffice` called with 2 args, expects 1 | Remove second argument `20000` |
| 2 | `src/components/dashboard/FundingChart.tsx` | 32-35 | `FundingRow` interface missing `calYear`, `fy`, `month` as compatible types | Add `calYear?: number \| string`, `fy?: string`, keep `month?: string` -- the index signature `[fscCode: string]: number \| string \| undefined` already covers the values, but explicit fields for `calYear` need to allow both types |
| 3 | `src/components/dashboard/TreemapChart.tsx` | 286 | `fetchAwardsByOffice` called with 2 args, expects 1 | Remove second argument `2000` |
| 4 | `src/components/dashboard/TreemapChart.tsx` | 596-597 | `showSearch` and `showLegend` props don't exist on `AwardTableProps` | Remove both props from the JSX |
| 5 | `src/pages/PointsOfContact.tsx` | 59 | `Set<unknown>` not assignable to `Set<string>` | Change to `new Set<string>(row.roles as string[])` |
| 6 | `supabase/functions/get-news/index.ts` | 89-90 | `err` is `unknown` | Change `err.message` to `(err as Error).message` |

## Step 1: Visual Style Refresh (incremental edits to existing files)

### Files to touch (max 10 total including build fixes):

1. **`src/index.css`** -- Enrich color palette, add animation keyframes for staggered entrance, improve dark mode contrast
2. **`src/components/AppSidebar.tsx`** -- Better active-state indicator (left accent border instead of right), smoother icon sizing, transition classes
3. **`src/App.tsx`** -- Subtle header gradient/shadow upgrade, add page-level fade-in wrapper
4. **`src/components/ui/TacticalComponents.tsx`** -- Make CorporateCard, CorporateInput, CorporateSelect dark-mode aware (replace hardcoded `bg-white`/`text-slate-*` with theme variables)
5. **`src/components/dashboard/FundingChart.tsx`** -- Chart tooltip/axis polish + build fix
6. **`src/components/dashboard/TreemapChart.tsx`** -- Tooltip polish + build fix
7. **`src/components/dashboard/WeaponPlatformCard.tsx`** -- Add hover shadow lift + subtle scale, dark mode card fixes
8. **`src/pages/Homepage.tsx`** -- Add animate-in class to page wrapper, subtle heading refinement
9. **`src/pages/WeaponsPlatforms.tsx`** -- Replace hardcoded `bg-slate-50`, `bg-white` with theme-aware classes (`bg-background`, `bg-card`)
10. **`src/pages/PointsOfContact.tsx`** -- Build fix + skeleton loader for loading state

### Specific visual changes:

- **Dark mode fixes**: Replace all hardcoded `bg-white`, `bg-slate-50`, `text-slate-*` in TacticalComponents, WeaponsPlatforms, and WeaponPlatformCard with theme-aware classes (`bg-card`, `bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`)
- **Card hover effects**: Add `transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5` to CorporateCard and WeaponPlatformCard
- **Sidebar active state**: Change from `border-r-2` to a left accent bar with `border-l-3 border-l-blue-400` for a cleaner active indicator
- **Chart polish**: Improve tooltip styling with better padding, rounded corners, and theme-aware background/border colors
- **Typography**: Increase heading `font-bold` to `font-extrabold` on page titles, add `tracking-tight` for tighter letter spacing
- **Page transitions**: Apply existing `animate-in` CSS class to page wrapper divs for smooth fade-in on navigation

## Step 2: Animations and Micro-interactions

These are added directly into the files above (no new dependencies):

- **Page fade-in**: Wrap each page's root `div` with the existing `animate-in` class
- **Staggered card entrance**: Add CSS animation-delay utility classes for card grids
- **Skeleton loaders**: Replace "Loading..." text with the existing `Skeleton` component in PointsOfContact and WeaponsPlatforms
- **Sidebar menu transitions**: Add `transition-all duration-200` to menu items
- **Button/card hover**: Smooth shadow and transform transitions already defined, just need to apply consistently

## What will NOT change:

- No routes added, removed, or renamed
- No Supabase schema, queries, or edge function logic changes (only the catch type fix)
- No chart library changes (Recharts stays)
- No file structure refactoring
- All environment variables preserved (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
- `BrowserRouter basename="/Eagle-Sight/"` stays as-is
