import "server-only";
import Redis from "ioredis";
import { createGame } from "../game/rules";
import type { Game } from "../game/types";

const key=(code:string)=>`ascent:room:${code}`;
const hasRedis=Boolean(process.env.REDIS_URL);
// Next dev reloads route modules during Fast Refresh. Keep development rooms on
// the Node process rather than the module instance so an edit does not erase an
// in-progress local lobby. Production always uses Redis.
const roomRegistry=globalThis as typeof globalThis & {__ascentRooms?:Map<string,Game>};
const local=roomRegistry.__ascentRooms??(roomRegistry.__ascentRooms=new Map<string,Game>());
let redis:Redis|undefined;
function client(){if(!hasRedis)return null;redis??=new Redis(process.env.REDIS_URL!,{maxRetriesPerRequest:2,enableReadyCheck:true});return redis;}
function requireProductionRedis(){if(process.env.VERCEL&&!hasRedis)throw new Error("REDIS_URL must be configured for production multiplayer.");}

export async function createRoom(code:string,hostToken:string,duration:number,maxPlayers:number){
 requireProductionRedis();
 const game=createGame(code,hostToken,duration,maxPlayers);const db=client();
 if(!db){local.set(code,game);return game;}
 const didSet=await db.set(key(code),JSON.stringify(game),"EX",86400,"NX");if(!didSet)throw new Error("Room code collision");return game;
}
export async function getRoom(code:string){requireProductionRedis();const db=client();if(!db)return local.get(code)||null;const raw=await db.get(key(code));return raw?JSON.parse(raw) as Game:null;}
export async function mutateRoom<T>(code:string,mutate:(game:Game)=>T|Promise<T>):Promise<T>{
 requireProductionRedis();
 const db=client();
 if(!db){const game=local.get(code);if(!game)throw new Error("Room not found");const result=await mutate(game);local.set(code,game);return result;}
 for(let retry=0;retry<6;retry++){
   await db.watch(key(code));const raw=await db.get(key(code));if(!raw){await db.unwatch();throw new Error("Room not found");}
   const game=JSON.parse(raw) as Game;const result=await mutate(game);const done=await db.multi().set(key(code),JSON.stringify(game),"EX",86400).exec();if(done)return result;
 }
 throw new Error("The room is busy. Try that again.");
}
export async function publish(code:string){const db=client();if(db)await db.publish("ascent:events",code);}
export const redisConfigured=hasRedis;
