import {me} from "@/lib/auth"; import {templateFs} from "@/lib/xl";
export const dynamic="force-dynamic";
export async function GET(){if(!me())return new Response("Login required",{status:401});
 return new Response(new Uint8Array(await templateFs()),{headers:{"Content-Type":"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","Content-Disposition":'attachment; filename="financial-statements-template.xlsx"'}})}
