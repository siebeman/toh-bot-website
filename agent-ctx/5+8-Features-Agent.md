# Task 5+8: Keyboard Shortcuts Help Panel + Favorite Players Feature

## Summary
Added two major features to the TOH Bot website:
1. **Keyboard Shortcuts Help Panel** - Glass card overlay toggled via "?" key showing all available shortcuts
2. **Favorite Players Feature** - Star-based favorites system on the Leaderboard page with localStorage persistence

## Files Modified
- `src/app/page.tsx` - Added Keyboard icon, showKbHelp state, "?" shortcut, keyboard help panel overlay
- `src/components/LeaderboardPage.tsx` - Added Star icon, favorites state, toggleFavorite callback, Favorites filter, Favorites section, star buttons on rows, fav-row class
- `src/app/globals.css` - Added ~330 lines of CSS (toh-kb-* and toh-fav-* prefixes) with light theme overrides

## Key Decisions
- Used "toh-kb-*" prefix for keyboard shortcuts CSS, "toh-fav-*" for favorites CSS
- Favorites stored as JSON array of usernames in localStorage under 'toh-favorites' key
- Escape key closes help panel first, then mobile menu (priority order)
- Favorites section only shows when NOT in favorites-only filter mode
- Star button uses e.stopPropagation() to prevent triggering row click

## Verification
- 0 lint errors
- Dev server compiling without errors
