# Deploy THE ASCENT to Vercel

1. Push this repository to GitHub and import it into Vercel as a Next.js project.
2. In the Vercel Marketplace, create or connect a free Neon Postgres database.
3. Set `DATABASE_URL` in Vercel Project Settings → Environment Variables. Use the connection URL supplied by Neon. Do not expose it with a `NEXT_PUBLIC_` prefix.
4. Set a long, unique `ADMIN_PASSWORD`. This protects `/admin`, the only page that can create a room.
5. Deploy. Open `https://your-project.vercel.app/admin` to create a game, then share the generated `/lobby/[code]` link or QR code with the class. Participants use the public home page only to join a room.

## Realtime transport

`/api/ws` remains an optional low-latency enhancement for clients connected to the same Function instance. Each action is validated and stored in Neon by the HTTP action route, and browsers poll the authoritative session endpoint every 1.2 seconds, so multiplayer remains correct across Vercel instances without Redis.

The WebSocket API is experimental. The client does not depend on a successful socket upgrade to stay correct: it retries the socket and polls state every 1.2 seconds.

## Verify before class

Run the game with a host and at least three independent browser sessions:

- Join the same six-character code from each session.
- Confirm that a build changes every view’s tower and leaderboard.
- Try two rapid build clicks and confirm only one is accepted during the cooldown.
- Accept a cooperation request and confirm both towers rise by two floors while both players spend 15 energy.
- Let a request run for 20 seconds and confirm it expires without rewards.
- Activate an Independence Shield, then freeze that player after the first minute and confirm the shield is consumed instead of disabling Build.
- Activate Overdrive and confirm a build gains three floors for 50 energy.
- Make and accept an incentive offer, confirming its floor transfer and shared rewards happen together.
- After the first minute, freeze a second player without a shield and confirm their Build button is disabled until recovery.
- Build from 20 energy to trigger exhaustion and confirm Rest cannot bypass it.
- Reload a player’s `/lobby/[code]` page and rejoin using the same browser session.
- Let the timer reach zero and compare all final standings.

Run `npm test` and `npm run build` before deployment. `vercel dev` is required if you want to exercise Vercel’s WebSocket upgrade locally; `next dev` still supports the HTTP routes and polling fallback.
