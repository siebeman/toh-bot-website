---
Task ID: 2
Agent: Main Agent
Task: Significantly improve styling details, add features, and polish the TOH Bot website

Work Log:
- Read all existing source files (page.tsx, HomePage.tsx, CommandsPage.tsx, RaceModePage.tsx, LeaderboardPage.tsx, globals.css, layout.tsx)
- Implemented hash-based routing in page.tsx: reads hash on mount, updates hash on navigate, listens for hashchange events (back/forward)
- Added animated number counters on HomePage using IntersectionObserver-based `AnimatedStat` component (counts from 0 to target over 1.5s with easeOutCubic)
- Added live ticking timer on RaceModePage using useEffect/setInterval (starts at 3:47, increments every second with subtle pulse animation)
- Added player detail modal on LeaderboardPage: shows name, rank, level with progress bar, next milestone visualization, country, device, last updated; click-outside-to-close, Escape key, smooth fade-in animation
- Added animated background particles canvas: subtle floating purple/white glowing dots that drift slowly, pointer-events: none
- Added page transition animations: fade + slide-up (12px) with 300ms duration when switching pages
- Added search highlighting on CommandsPage: wraps matched text in `<mark>` elements with purple/violet highlight styling
- Home page polish: floating mockup animation (gentle bob), staggered fade-in for feature cards (100ms delay each), shimmer animation on hero gradient text, "View Leaderboard" CTA button, pulsing glow behind hero stats
- Commands page polish: category icons (⚡ General, ⚡ XP & Levels, 🏁 Race, 🏆 Leaderboard, ⚙️ Admin), command count badges, hover left border color slide
- Race Mode polish: staggered slide-in entrance animation for racer cards, position indicators (1st/2nd/3rd/4th with colored badges/borders), progress bars animate on mount, prominent pulse on live dot
- Leaderboard polish: Top 3 Podium section above table with medals/avatars/level bars, row hover with left border slide, staggered row fade-in, prominent pulse on status dot, data source note, per-page selector (25/50/100)
- Footer polish: social links (Discord, GitHub icons), "Made with ❤️" line, gradient border-top
- Added scroll-to-top button: appears after 300px scroll, smooth scroll, purple accent, fade animation
- Mobile improvements: table scrollable with gradient fade on right edge, podium stacks vertically on mobile, hero actions stack vertically on small screens
- All CSS additions use toh-* prefix following existing convention
- Fixed all lint errors (8 → 0): resolved react-hooks/set-state-in-effect and react-hooks/refs issues
- Dev server running without errors

Stage Summary:
- All 10 required improvements implemented with full CSS styling
- 0 lint errors
- No runtime errors in dev server
- Site now has: hash routing, animated counters, live timer, player modal, particles, page transitions, search highlighting, extensive polish across all pages, scroll-to-top, mobile improvements
