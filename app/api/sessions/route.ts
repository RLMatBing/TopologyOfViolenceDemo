import { NextResponse } from "next/server";
import { makeCode } from "../../../lib/game/code";
import { createRoom } from "../../../lib/server/store";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function POST(request:Request){try{const body=await request.json() as {duration?:number;maxPlayers?:number};const duration=Math.max(60,Math.min(3600,Number(body.duration)||600));const maxPlayers=Math.max(2,Math.min(20,Number(body.maxPlayers)||16));for(let i=0;i<5;i++){const code=makeCode(),hostToken=crypto.randomUUID();try{await createRoom(code,hostToken,duration,maxPlayers);return NextResponse.json({code,hostToken});}catch{}}return NextResponse.json({error:"Could not create a room."},{status:503});}catch{return NextResponse.json({error:"Invalid request."},{status:400});}}
