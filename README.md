# OpTracker

A luxury-minimal viewer for **real job platforms**. Live roles are pulled from public JSON APIs, then screened. Expired, broken, mock, and placeholder listings never reach the board.

The previous repository was an empty stub. This rebuild adds the product architecture, integrity pipeline, and iPhone-first interface.

## Design

- Editorial luxury on obsidian `#09090b`
- Newsreader for titles, Inter for UI
- Hairline lists, real search/segment controls, almost no cards or chips
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

- **Roles** — live, already-screened listings
- **Boards** — curated real platforms (API + directory)
- **Pulse** — at most five source fetches per UTC day, with an optional brief to [Poke](https://poke.com)
- **Saved** — device-local bookmarks of still-live roles

## Data policy

No seed jobs are committed. An empty board is the honest default. Pulse a public API from `/pulse` to populate `data/catalog.json` (gitignored). See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/DATA_INTEGRITY.md](docs/DATA_INTEGRITY.md), and [docs/POKE.md](docs/POKE.md).
