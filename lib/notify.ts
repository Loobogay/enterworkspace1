import {uid} from "./db";
export const recHref=(a:any)=>(a.kind==="fs"?"/statements/":"/applications/")+a.id;
export const userIdByName=(d:any,name:string)=>d.users.find((x:any)=>x.name===name)?.id||"";
export function notify(d:any,o:{role?:string;user?:string;text:string;href:string}){d.notes=d.notes||[];if(!o.role&&!o.user)return;
  d.notes.push({id:uid(),role:o.role||"",user:o.user||"",text:o.text,href:o.href,at:new Date().toISOString(),seen:[]});if(d.notes.length>300)d.notes=d.notes.slice(-300)}
export const mineNotes=(d:any,u:any)=>(d.notes||[]).filter((n:any)=>n.user?n.user===u.id:n.role===u.role).slice(-20).reverse();
