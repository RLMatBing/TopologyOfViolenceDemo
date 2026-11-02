import "server-only";
import type { WebSocket } from "ws";

type Socket=WebSocket & { ascentCode?:string };
const sockets=new Map<string,Set<Socket>>();
let subscribed=false;
function broadcast(code:string){for(const ws of sockets.get(code)||[])if(ws.readyState===ws.OPEN)ws.send(JSON.stringify({type:"changed",code}));}
export function register(ws:Socket){ws.on("message",data=>{try{const message=JSON.parse(data.toString()) as {type:string;code?:string};if(message.type==="join"&&message.code){ws.ascentCode=message.code.toUpperCase();let room=sockets.get(ws.ascentCode);if(!room)sockets.set(ws.ascentCode,room=new Set());room.add(ws);ws.send(JSON.stringify({type:"ready"}));}}catch{/* malformed messages are ignored */}});ws.on("close",()=>{if(ws.ascentCode)sockets.get(ws.ascentCode)?.delete(ws);});}
export async function notify(code:string){broadcast(code);}
export function startSubscriber(){if(subscribed)return;subscribed=true;}
