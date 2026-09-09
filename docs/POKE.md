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

## Inbound MCP

Poke can query the same screened board the UI shows.

1. Set `OPTRACKER_MCP_TOKEN` (or reuse `POKE_API_KEY`).
2. Point Poke at `https://<your-host>/mcp` with that token as the integration API key.
3. Prefill: `https://poke.com/integrations/new?name=OpTracker&url=https://<your-host>/mcp`.

Locally: run OpTracker, then `npx poke@latest tunnel http://localhost:3000/mcp -n OpTracker -k "$OPTRACKER_MCP_TOKEN"`.

Tools: `list_roles`, `get_role`, `list_boards`, `get_budget`, `pulse_board`. `pulse_board` spends one of the five UTC-day pulses and only runs when Poke is explicitly asked to fetch a board.
