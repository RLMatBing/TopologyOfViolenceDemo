# THE ASCENT

A browser-based classroom multiplayer game inspired by Byung-Chul Han's *The Topology of Violence*.

Players build visible towers in one shared 3D arena. Build costs energy, rest restores it, cooperation raises two towers after both players agree, and Freeze temporarily stops another player from building. The winner has the tallest tower when time expires.

## Run locally

```bash
npm install
npm run dev
npm test
```

Open `http://localhost:3000`. For durable multi-device or Vercel testing, set `DATABASE_URL` in `.env.local` to a Neon Postgres connection URL. Without it, local development uses an in-memory room store, which works only inside that one local process.

## Routes

- `/` participant-only join screen
- `/admin` password-protected host-only room creation
- `/lobby/[code]` player lobby and reconnect link
- `/host/[code]` host lobby and match controls
- `/game/[code]` player game view
- `/results/[code]` results view

## Rules

- Build: +1 floor for 20 energy, or +3 floors for 50 energy while Overdrive is active; 2 second cooldown
- Rest: +30 energy, capped at 100, with a 5 second cooldown
- Cooperation: a recipient must accept; both players spend 15 energy and gain +2 floors; requests expire after 20 seconds
- Incentive offer: offer one existing floor; accepted offers transfer that floor and complete cooperation atomically
- Freeze: three charges per player, unlocks after the player has built five floors, and blocks target building for 15 seconds; an active Independence Shield blocks one Freeze
- Overdrive: 20 seconds of high-output construction with a 60 second activation cooldown
- Exhaustion: reaching zero energy locks construction for 30 seconds, then returns energy to 40
- Tower styles: after building three floors, each player permanently chooses Rapid, Efficient, Collective, or balanced Foundation

All gameplay actions are submitted as server intentions. The route handler validates the room, player token, phase, timestamps, energy, cooldowns, style rules, action target, pending-request state, and expiration before storing the authoritative game state. The shared activity feed and postgame bar charts are generated from those same validated events.

## Production deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md). Use free Neon Postgres in production. Database URLs and host tokens remain server-side; browser clients receive a session scoped player token only.
