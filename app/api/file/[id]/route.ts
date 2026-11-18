import {load,getFile} from "@/lib/db"; import {me} from "@/lib/auth";
export const dynamic="force-dynamic";
export async function GET(_:Request,{params}:any){if(!me())return new Response("Login required",{status:401});
 const d=load();let m:any;for(const r of [...d.apps,...d.fss])for(const x of r.files||[])if(x.id===params.id)m=x;if(!m)return new Response("Not found",{status:404});
 const b=await getFile(params.id);if(!b)return new Response("File missing",{status:404});const inline=["application/pdf","image/png","image/jpeg"].includes(m.mime);
 return new Response(new Uint8Array(b),{headers:{"Content-Type":m.mime,"Content-Disposition":`${inline?"inline":"attachment"}; filename="${m.name}"`,"X-Content-Type-Options":"nosniff"}})}
