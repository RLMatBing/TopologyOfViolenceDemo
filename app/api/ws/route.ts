import { experimental_upgradeWebSocket } from "@vercel/functions";
import { register, startSubscriber } from "../../../lib/server/hub";
export const runtime="nodejs";export const dynamic="force-dynamic";export const maxDuration=300;
export async function GET(){startSubscriber();return experimental_upgradeWebSocket(ws=>{register(ws);});}
