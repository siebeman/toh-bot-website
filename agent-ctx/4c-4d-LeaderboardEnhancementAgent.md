# Task 4c-4d: Leaderboard Enhancement Agent

## Task Summary
Update LeaderboardPage.tsx with 5 new features: favorite/star button updates, filter by favorites, rank change indicators, search focus event, and enhanced row hover effects.

## Changes Made

### 1. Star Button in Table Rows
- Changed CSS class from `toh-fav-star-btn` → `toh-lb-star-btn`
- Changed active CSS class from `toh-fav-star-active` → `toh-lb-star-btn-active`
- Increased Star icon size from 14px → 16px
- Already had: stopPropagation on click, gold fill when favorited, outlined when not

### 2. Favorites Filter Button
- Changed CSS class from `toh-fav-filter-btn` → `toh-lb-fav-filter`
- Changed active CSS class from `toh-fav-filter-active` → `toh-lb-fav-filter-active`
- Already had: Star icon, "Favorites" label, count badge, toggle showFavoritesOnly

### 3. Rank Change Indicators
- Added `rankChanges` useMemo (line ~725) that generates deterministic rank changes based on username hash
- Distribution: 60% same (no indicator), 20% up (green ↑+N), 20% down (red ↓-N)
- Type: `Record<string, { direction: 'up' | 'down' | 'same'; amount: number }>`
- Added JSX to display rank change indicators next to rank numbers using `toh-lb-rank-change`, `toh-lb-rank-up`, `toh-lb-rank-down` classes

### 4. Search Focus on Custom Event
- Already existed (lines 554-565), no changes needed
- Listens for `toh-focus-search` event and focuses active or banned search input based on tab

### 5. Enhanced Row Hover Effects
- Added `toh-lb-row-enhanced` class to active player table row className
- CSS styling for left border accent and background gradient shift to be added to globals.css separately

## Verification
- Ran `bun run lint`: 0 errors
- Dev server compiling without errors

## CSS Classes Referenced (to be styled in globals.css)
- `.toh-lb-star-btn` — star button in table row
- `.toh-lb-star-btn-active` — active/favorited star button
- `.toh-lb-fav-filter` — favorites filter button
- `.toh-lb-fav-filter-active` — active favorites filter
- `.toh-lb-rank-change` — rank change indicator container
- `.toh-lb-rank-up` — rank up indicator (green)
- `.toh-lb-rank-down` — rank down indicator (red)
- `.toh-lb-row-enhanced` — enhanced row hover effects
