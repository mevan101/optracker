const key = process.env.POKE_API_KEY?.trim();
if (!key) {
  console.log("POKE_API_KEY is not set. Skipping deploy brief.");
  process.exit(0);
}

const message = [
  "Deploy OpTracker as a permanent public site using my Vercel integration.",
  "Do not use an anonymous 60-minute Vercel claim link. Create or update a Vercel project tied to this GitHub repo so the URL stays up on every push.",
  "",
  "Repo: https://github.com/mevan101/optracker",
  "Branch: cursor/poke-sync-flawless-7446",
  "PR: https://github.com/mevan101/optracker/pull/3",
  "",
  "Stack: Next.js 15, Node 22, `npm ci` then `npm run build`.",
  "On Vercel the job catalog writes to /tmp (or OPTRACKER_DATA_DIR). That is expected.",
  "Optional env: POKE_API_KEY (Kitchen V2 inbound), OPTRACKER_MCP_TOKEN (Bearer for /mcp).",
  "",
  "When it is live:",
  "- Reply with the permanent https://*.vercel.app URL.",
  "- Attach MCP at https://<that-host>/mcp so I can list roles from chat.",
  "- Do not merge the PR, email anyone, or spend OpTracker pulses.",
].join("\n");

const response = await fetch("https://poke.com/api/v1/inbound/api-message", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  body: JSON.stringify({ message }),
});

if (!response.ok) {
  console.error(`Poke responded ${response.status}`);
  process.exit(1);
}

console.log("Poke has the deploy brief.");
