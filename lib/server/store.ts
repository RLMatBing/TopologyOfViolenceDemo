import "server-only";
import { neon } from "@neondatabase/serverless";
import { createGame } from "../game/rules";
import type { Game } from "../game/types";

// Neon is available on a free tier and works with Vercel's serverless runtime.
// The polling client already keeps every browser current, so Redis pub/sub is
// not needed for gameplay correctness.
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL;
const roomRegistry = globalThis as typeof globalThis & { __ascentRooms?: Map<string, Game> };
const local = roomRegistry.__ascentRooms ?? (roomRegistry.__ascentRooms = new Map<string, Game>());
let schemaReady: Promise<void> | undefined;

function database() {
  return databaseUrl ? neon(databaseUrl) : null;
}

function requireProductionDatabase() {
  if (process.env.VERCEL && !databaseUrl) {
    throw new Error("A free Neon Postgres connection is required for production multiplayer. Set DATABASE_URL in Vercel.");
  }
}

async function ensureSchema() {
  const db = database();
  if (!db) return;
  schemaReady ??= db`
    CREATE TABLE IF NOT EXISTS ascent_rooms (
      code TEXT PRIMARY KEY,
      game JSONB NOT NULL,
      version INTEGER NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL
    )
  `.then(() => undefined);
  await schemaReady;
}

export async function createRoom(code: string, hostToken: string, duration: number, maxPlayers: number) {
  requireProductionDatabase();
  const game = createGame(code, hostToken, duration, maxPlayers);
  const db = database();
  if (!db) {
    local.set(code, game);
    return game;
  }
  await ensureSchema();
  const rows = await db`
    INSERT INTO ascent_rooms (code, game, version, expires_at)
    VALUES (${code}, ${JSON.stringify(game)}::jsonb, ${game.version}, NOW() + INTERVAL '24 hours')
    ON CONFLICT (code) DO NOTHING
    RETURNING code
  `;
  if (!rows.length) throw new Error("Room code collision");
  return game;
}

export async function getRoom(code: string) {
  requireProductionDatabase();
  const db = database();
  if (!db) return local.get(code) || null;
  await ensureSchema();
  const rows = await db`SELECT game FROM ascent_rooms WHERE code = ${code} AND expires_at > NOW()`;
  return rows[0] ? (rows[0].game as Game) : null;
}

export async function mutateRoom<T>(code: string, mutate: (game: Game) => T | Promise<T>): Promise<T> {
  requireProductionDatabase();
  const db = database();
  if (!db) {
    const game = local.get(code);
    if (!game) throw new Error("Room not found");
    const result = await mutate(game);
    local.set(code, game);
    return result;
  }
  await ensureSchema();
  for (let retry = 0; retry < 6; retry += 1) {
    const rows = await db`SELECT game, version FROM ascent_rooms WHERE code = ${code} AND expires_at > NOW()`;
    const row = rows[0] as { game: Game; version: number } | undefined;
    if (!row) throw new Error("Room not found");
    const game = row.game;
    const result = await mutate(game);
    const updated = await db`
      UPDATE ascent_rooms
      SET game = ${JSON.stringify(game)}::jsonb, version = ${game.version}, expires_at = NOW() + INTERVAL '24 hours'
      WHERE code = ${code} AND version = ${row.version}
      RETURNING code
    `;
    if (updated.length) return result;
  }
  throw new Error("The room is busy. Try that again.");
}

// Kept as a no-op compatibility hook. The browser polls the authoritative
// room endpoint, which works across all Vercel instances without pub/sub.
export async function publish(_code: string) {}
export const databaseConfigured = Boolean(databaseUrl);
