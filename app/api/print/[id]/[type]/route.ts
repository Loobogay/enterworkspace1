import {load,save,findRec} from "@/lib/db"; import {me} from "@/lib/auth"; import {logPrint} from "@/lib/docflow";
export const dynamic="force-dynamic";
export async function POST(_:Request,{params}:any){const u=me();if(!u||u.role!=="Secretary")return new Response("Only the Secretary can print.",{status:403});
 const d=load();const a=findRec(d,params.id);if(!a?.docs)return new Response("Not found",{status:404});
 const types=params.type==="pkg"?["letter","plan"]:[params.type];
 if(types.some(t=>a.docs[t]?.status!=="Approved"))return new Response("Document is not approved.",{status:403});
 types.forEach(t=>{logPrint(a,t,u,"print");d.log.unshift({t:new Date().toISOString(),u:u.name,a:`Printed ${a.docs[t].title} v${a.docs[t].version}`,ref:a.code})});
 save(d);return Response.json({ok:true})}
