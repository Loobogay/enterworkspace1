import {load} from "@/lib/db"; import {me} from "@/lib/auth"; import {live} from "@/lib/fin";
export const dynamic="force-dynamic";
export async function GET(r:Request){const u=me();if(!u||!["Administrator","Audit"].includes(u.role))return new Response("Administrator or Audit only",{status:403});
 const m=new URL(r.url).searchParams.get("month")||"";const q=(v:any)=>'"'+String(v??"").replace(/"/g,'""')+'"';
 const rows=live(load()).filter((x:any)=>x.date.startsWith(m)).sort((a:any,b:any)=>a.date.localeCompare(b.date));
 const csv=["Date,Type,Party,Category,Method,Amount,Note",...rows.map((x:any)=>[x.date,x.type,x.party,x.cat,x.method,x.amount,x.note].map(q).join(","))].join("\n");
 return new Response(csv,{headers:{"Content-Type":"text/csv","Content-Disposition":`attachment; filename="finance-${m||"all"}.csv"`}})}
