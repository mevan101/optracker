# Poke sync

OpTracker briefs [Poke](https://poke.com) after a successful pulse and exposes the live catalog as an MCP server Poke can call.

This is a bridge, not a scrape. Directory boards stay links. Integrity screening still drops expired, mock, broken, and placeholder rows before anything is sent.

## Outbound briefs

1. Create a **V2 Kitchen API key** at [poke.com/kitchen](https://poke.com/kitchen) (API Keys).
2. Set `POKE_API_KEY` in `.env.local`. Never commit it.
3. Pulse a JSON feed. If roles are kept, OpTracker POSTs to `https://poke.com/api/v1/inbound/api-message`.
4. Open a role and use **Ask Poke** to send that listing only.
5. **Send a test** on Pulse to confirm delivery without creating calendar events or mail.

A missing key, a failed pulse, or a pulse that kept zero roles does not call Poke. A Poke outage never rolls back the catalog.

## Deploy

Poke owns the public host. Connect the **Vercel** recipe at [poke.com/recipes](https://poke.com/recipes), then send this brief (Pulse → **Copy deploy brief**, or **Ask Poke to deploy** when `POKE_API_KEY` is set):

```
Deploy OpTracker as a permanent public site using my Vercel integration.
Do not use an anonymous 60-minute Vercel claim link. Create or update a Vercel project tied to this GitHub repo so the URL stays up on every push.

Repo: https://github.com/mevan101/optracker
Branch: cursor/poke-sync-flawless-7446
PR: https://github.com/mevan101/optracker/pull/3
```

GitHub Actions: **Ask Poke to deploy** (`workflow_dispatch`) posts the same brief when `POKE_API_KEY` is a repository secret.

Once the site is live, point Poke MCP at `https://<host>/mcp`.

## Inbound MCP

Poke can query the same screened board the UI shows.

1. Set `OPTRACKER_MCP_TOKEN` (or reuse `POKE_API_KEY`).
2. Point Poke at `https://<your-host>/mcp` with that token as the integration API key.
3. Prefill: `https://poke.com/integrations/new?name=OpTracker&url=https://<your-host>/mcp`.

Locally: run OpTracker, then `npx poke@latest tunnel http://localhost:3000/mcp -n OpTracker -k "$OPTRACKER_MCP_TOKEN"`.

Tools: `list_roles`, `get_role`, `list_boards`, `get_budget`, `pulse_board`. `pulse_board` spends one of the five UTC-day pulses and only runs when Poke is explicitly asked to fetch a board.
