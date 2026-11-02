import { NextResponse } from "next/server";
import { addPlayer, publicGame } from "../../../../lib/game/rules";
import { getRoom, mutateRoom } from "../../../../lib/server/store";
import { notify } from "../../../../lib/server/hub";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(_:Request,{params}:{params:Promise<{code:string}>}){const {code}=await params;const game=await getRoom(code.toUpperCase());return game?NextResponse.json({game:publicGame(game)}):NextResponse.json({error:"Room not found."},{status:404});}
export async function POST(request:Request,{params}:{params:Promise<{code:string}>}){try{const {code}=await params;const body=await request.json() as {name?:string;token?:string};const token=body.token||crypto.randomUUID();const result=await mutateRoom(code.toUpperCase(),game=>addPlayer(game,token,body.name||"",Date.now()));if(!result.ok)return NextResponse.json({error:result.message},{status:400});await notify(code.toUpperCase());return NextResponse.json({token,game:publicGame(result.game)});}catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Unable to join."},{status:400});}}
