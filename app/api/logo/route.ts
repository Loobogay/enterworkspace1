import fs from "fs"; import path from "path"; import {company,getFile} from "@/lib/db";
export const dynamic="force-dynamic";
export async function GET(){const c:any=company();
 if(c.logo){const b=await getFile(c.logo.id);if(b)return new Response(new Uint8Array(b),{headers:{"Content-Type":c.logo.mime,"Cache-Control":"no-cache","X-Content-Type-Options":"nosniff"}})}
 const b=fs.readFileSync(path.join(process.cwd(),"public","logo.png"));return new Response(new Uint8Array(b),{headers:{"Content-Type":"image/png","Cache-Control":"no-cache"}})}
