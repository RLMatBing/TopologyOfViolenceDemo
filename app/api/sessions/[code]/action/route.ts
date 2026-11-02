import { NextResponse } from "next/server";
import { apply, publicGame } from "../../../../../lib/game/rules";
import type { Action } from "../../../../../lib/game/types";
import { mutateRoom } from "../../../../../lib/server/store";
import { notify } from "../../../../../lib/server/hub";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function POST(request:Request,{params}:{params:Promise<{code:string}>}){try{const {code}=await params;const body=await request.json() as {token?:string;action?:Action};if(!body.token||!body.action)return NextResponse.json({error:"Missing game action."},{status:400});const result=await mutateRoom(code.toUpperCase(),game=>apply(game,body.token!,body.action!));if(!result.ok)return NextResponse.json({error:result.message},{status:400});await notify(code.toUpperCase());return NextResponse.json({game:publicGame(result.game),message:result.message},{headers:{"cache-control":"no-store"}});}catch(error){console.error("[room-action] failed",error);return NextResponse.json({error:"Room temporarily unavailable. Your player is still in the room; try again."},{status:503,headers:{"retry-after":"1"}});}}
