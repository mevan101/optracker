# Data integrity

OpTracker does **not** ship fabricated job listings. The catalog file is created only after a user (or operator) pulses a registered public API.

## Rules enforced in code

- Maximum **5 crawls per UTC day** (`MAX_CRAWLS_PER_DAY`).
- Only allowlisted platform ids can produce listings.
- `example.com`, `localhost`, and similar hosts are rejected.
- Expired, broken, mock, and placeholder rows are counted and discarded.
- Discover, Saved, and job detail all read through `presentCatalog`, which hides anything that later fails the same filters.

## What CI verifies

Unit tests use **fixtures**, not a live crawl:

- Budget reset and the sixth-crawl refusal.
- Normalizers for Remote OK, Remotive, Arbeitnow, and Jobicy field names.
- Screening that keeps one clean row and drops expired/mock/placeholder/broken rows.

CI does not assert that third-party APIs are up. A successful local pulse against those APIs is an operator action, not a claimed verification in this repository.

## Operator pulse

```bash
npm run dev
```

Open `/pulse` and pulse at most five API boards. Attribution links stay on every card. If a source is down, the UI reports the failure and shows an empty or partial board rather than inventing replacements.
