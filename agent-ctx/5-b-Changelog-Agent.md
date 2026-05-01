# Task 5-b: Changelog Agent

## Task
Add "What's New" / Changelog section to the TOH Bot website Home page

## Work Completed
- Added CHANGELOG data array with 5 entries (v2.4–v2.0) to HomePage.tsx
- Added changelogRevealRef using existing useScrollReveal hook
- Added Changelog section JSX between Features and FAQ sections
- Added ~200 lines of CSS to globals.css with toh-* prefix
- Vertical timeline with indigo dots, connecting lines, and pulsing animation
- Tag badges with semantic color coding (green=New Feature, purple=Improved, red=Fixed)
- Staggered entrance animations (120ms per entry)
- Responsive breakpoint at 640px
- 0 lint errors, dev server compiling successfully

## Key Files Modified
- `/home/z/my-project/src/components/HomePage.tsx` — Added CHANGELOG data, changelogRevealRef, and Changelog section JSX
- `/home/z/my-project/src/app/globals.css` — Added ~200 lines of toh-changelog-* CSS classes
- `/home/z/my-project/worklog.md` — Updated with work record
