# Changelog

## [1.0.0] - 2026-07-17

### Added
- Full responsive layout: 320px mobile to 4K desktop, landscape support
- PWA support: manifest.json, service worker with offline caching
- SVG app icons (192x192, 512x512) for installable PWA
- iOS splash screen meta tags
- Service worker for offline capability on cached assets
- Screen shortcut navigation via URL parameter (?screen=home)
- `clamp()` based sizing for fluid typography and spacing
- Grid adjustments for tablet (600px+) and desktop (1024px+)

### Fixed
- `globalThis.formatCurrency` → `g.formatCurrency` in goals.js
- `s` regex flag → cross-browser `[\s\S]` in ai-advisor.js
- Typing indicator cleanup in error paths (ai-advisor.js)
- Budget category matching now correctly filters expenses
- Modal component now uses proper `clamp()` sizing
- Various edge cases in DOM element existence checks

### Changed
- CSS completely rewritten with responsive `clamp()` and media queries
- Bottom nav: `max-width` matches app container
- Quick actions grid: 4-col default, 2-col on very small screens, 6-col on desktop
- Stat cards: 2-col mobile, 4-col tablet+
- Category picker: 4-col mobile, 5-col tablet+
- Achievement grid: 3-col mobile, 4-col tablet, 5-col desktop
- Modal: bottom sheet on mobile, centered dialog on desktop
- Onboarding: single column mobile, 2-column grid on tablet
- Chat messages: 85% width mobile, 70% desktop
- Server now sends `Cache-Control: no-cache` for JS files

### Removed
- Dead CSS code (unused animations, duplicate selectors)

### Notes
- Splash screen PNGs not generated (SVG icons used for manifest)
- Actual PNG icons can be generated from SVG sources
