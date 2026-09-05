# OpTracker

A luxury-minimal viewer for **real job platforms**. Live roles are pulled from public JSON APIs, then screened. Expired, broken, mock, and placeholder listings never reach the board.

The previous repository was an empty stub. This rebuild adds the product architecture, integrity pipeline, and iPhone-first interface.

## Design

- Apple ultra-premium luxury minimalism
- Obsidian / slate canvas `#09090b`
- Restrained glass, 0.5px whisper borders `rgba(255,255,255,0.05)`
- Inter + SF Pro, tracking `-0.02em`
- Tuned for iPhone 16 Pro at 402 CSS pixels, including `safe-area-inset-top`

## Scripts

```bash
npm install
npm test
npm run typecheck
npm run lint
npm run build
npm run dev
```

## Product surfaces

- **Discover** — live, already-screened roles
- **Boards** — curated real platforms (API + directory)
- **Pulse** — at most five source fetches per UTC day
- **Saved** — device-local bookmarks of still-live roles

## Data policy

No seed jobs are committed. An empty board is the honest default. Pulse a public API from `/pulse` to populate `data/catalog.json` (gitignored). See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [docs/DATA_INTEGRITY.md](docs/DATA_INTEGRITY.md).
