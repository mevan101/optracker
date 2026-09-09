# OpTracker architecture

The repository started as an empty MIT stub (`README.md` + `LICENSE`). This rebuild establishes a complete Next.js application instead of layering features onto missing product code.

## Shape

```
src/app            App Router pages and JSON API
src/components     Luxury-minimal UI (Discover, Boards, Pulse, Saved, states)
src/lib/domain     Platforms catalog, validation, integrity filters
src/lib/crawl      Daily budget, source adapters, screening, orchestration
src/lib/poke       Outbound Poke briefs + inbound MCP tools
src/lib/store      Filesystem catalog (no invented seed listings)
```

Displayed jobs are produced only by:

1. Fetching a **public JSON API** from a crawlable, real platform.
2. Normalizing the payload into a `JobListing`.
3. Validating required fields and URL hosts.
4. Rejecting expired, broken, mock, and placeholder records.
5. Persisting the accepted set for that platform.

Directory platforms (LinkedIn, Indeed, Wellfound, We Work Remotely, Ashby, Greenhouse) are official destinations only. They are never crawled and never given fabricated listings.

## Crawl budget

- Hard limit: **5 crawls per UTC day**.
- One crawl = one source pulse (one registered public API).
- A refused sixth crawl returns HTTP 429 and does not write listings.
- A failed fetch still consumes budget so a broken source cannot be hammered.

## Integrity screen

Rejected listings never enter the Discover feed:

| Reason | Signal |
| --- | --- |
| `expired` | `expiresAt` in the past, posted older than 45 days, or closed-role language |
| `broken` | Non-http URL, blocked hosts, empty/N-A titles |
| `mock` | Dummy/Acme/lorem/test-job language or `mock-` ids |
| `placeholder` | Placeholder/TBD/example copy or example hosts |
| `invalid` | Schema failure or unknown platform |
| `duplicate` | Canonical URL already kept |

`presentCatalog` re-filters the stored file on every read so stale rows cannot reappear.

## Sources

Adapters exist only for documented public feeds:

- Remote OK `https://remoteok.com/api`
- Remotive `https://remotive.com/api/remote-jobs`
- Arbeitnow `https://www.arbeitnow.com/api/job-board-api`
- Jobicy `https://jobicy.com/api/v2/remote-jobs`

Each card links back to the original platform URL. OpTracker does not scrape HTML career pages and does not claim live crawl verification in CI.

## UI

Editorial luxury on obsidian `#09090b`: Inter + SF Pro, `-0.02em` tracking, hairline separators instead of card stacks, glass reserved for the tab bar. Tuned for iPhone 16 Pro (402 CSS px) with `viewport-fit=cover` and safe-area insets. Loading, error, empty, and filtered-detail states are first-class.

## Performance

- Search and work-mode filters run against the already-rendered catalog — no refetch on keystroke.
- Boards is a server component. Pulse and Saved only hydrate the controls they need.
- Job cards use paint-cheap `.panel` surfaces (no backdrop-filter). Blur is reserved for the tab bar.
- Motion is transform/opacity only (`translate3d` / `scale3d` / `scaleX`), with `prefers-reduced-motion` respected.
- Reserved min-heights on headers, empty states, and cards reduce layout shift at 402px.
- Catalog writes are atomic. Overlapping pulses are serialized so the daily cap cannot be double-spent.
- `presentCatalog` re-validates stored rows so a corrupt or mock record cannot reappear on read.
- After a pulse keeps roles, OpTracker may brief Poke (`POKE_API_KEY`). A Poke failure never writes listings or spends an extra pulse.
- Poke MCP (`/mcp`) reads the same screened catalog the UI shows. `pulse_board` is the only mutating tool and still pays the five-per-day cap.
