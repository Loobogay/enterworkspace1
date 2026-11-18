import {cookies} from "next/headers"; import {redirect} from "next/navigation"; import crypto from "crypto"; import {load} from "./db";
const sign=(v:string)=>crypto.createHmac("sha256",process.env.APP_SECRET||"change-me-secret").update(v).digest("hex");
export function setSession(id:string){const v=id+"|"+(Date.now()+8*36e5);cookies().set("ew",v+"|"+sign(v),{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",path:"/"})}
export const clearSession=()=>cookies().delete("ew");
export function me():any{const c=cookies().get("ew")?.value;if(!c)return null;const p=c.split("|");if(p.length!==3||sign(p[0]+"|"+p[1])!==p[2]||+p[1]<Date.now())return null;return load().users.find((u:any)=>u.id===p[0]&&u.active)||null}
export function need(...r:string[]){const u=me();if(!u)redirect("/login");if(r.length&&!r.includes(u.role))redirect("/?denied=1");return u}
