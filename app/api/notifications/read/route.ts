import {load,save} from "@/lib/db"; import {me} from "@/lib/auth"; import {mineNotes} from "@/lib/notify";
export const dynamic="force-dynamic";
export async function POST(){const u=me();if(!u)return new Response("Login required",{status:401});const d=load();let c=0;
 for(const n of mineNotes(d,u))if(!n.seen.includes(u.id)){n.seen.push(u.id);c++}
 if(c)save(d);return Response.json({ok:true})}
