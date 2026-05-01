# Task 4a-4h: Global Features Agent

## Task
Add 5 global features to the TOH Bot website main page.tsx:
1. Scroll Progress Indicator
2. Notification Center
3. Cookie Consent Banner
4. Search Keyboard Shortcut (/)
5. Enhanced Mobile Menu

## Work Completed

### Files Modified
- `src/app/page.tsx` — Major updates (528 → ~600 lines)
- `src/app/globals.css` — Added ~400 lines of CSS
- `src/components/CommandsPage.tsx` — Added searchInputRef and toh-focus-search listener
- `src/components/LeaderboardPage.tsx` — Added activeSearchRef, bannedSearchRef, and toh-focus-search listener

### Feature Details

1. **Scroll Progress Indicator**
   - `scrollProgress` state tracked via scroll event
   - Fixed div at top with z-index 9999
   - 3px height, indigo→violet gradient, box-shadow glow
   - Width calculated as (scrollY / (docHeight - viewportHeight)) * 100%
   - 100ms ease-out transition

2. **Notification Center**
   - Bell icon from lucide-react in nav-actions
   - `showNotifications` state, `notifications` array with 5 mock items
   - Red badge with unread count and pulse animation
   - Dropdown with glassmorphism (24px blur, semi-transparent bg, border-radius 16px)
   - Click to mark as read, "Mark all as read" button
   - Outside-click close, Escape key close
   - Slide-in animation on open

3. **Cookie Consent Banner**
   - `showCookieBanner` state, checks localStorage on mount
   - Fixed bottom, semi-transparent dark bg with backdrop blur
   - Slide-up entrance animation (0.4s cubic-bezier)
   - Accept button (indigo gradient), Learn More ghost link
   - Responsive (stacks on mobile)

4. **Search Keyboard Shortcut (/)**
   - `/` dispatches `toh-focus-search` custom event on commands/leaderboard pages
   - `?` still toggles keyboard help
   - CommandsPage: searchInputRef + event listener → focuses search input
   - LeaderboardPage: activeSearchRef/bannedSearchRef + event listener → focuses correct input based on tab
   - Added `/` shortcut row to keyboard help panel

5. **Enhanced Mobile Menu**
   - Always rendered (no conditional rendering with `&&`)
   - CSS class toggle (`open` class) for show/hide
   - CSS transitions for max-height, opacity, padding
   - Removed inline styles that overrode CSS transitions

### Verification
- `bun run lint`: 0 errors
- Dev server compiling without errors
- All existing functionality preserved
