"use client";
import {useState} from "react";import {usePathname} from "next/navigation";
const P:any={home:"M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z",users:"M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M21 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8",money:"M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",file:"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",folder:"M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",pie:"M21.2 15.9A10 10 0 1 1 8 2.8M22 12A10 10 0 0 0 12 2v10z",sliders:"M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"};
export type It={l:string;h?:string;i:string;ch?:{l:string;h:string}[]};
export default function Nav({items}:{items:It[]}){const p=usePathname();const on=(h:string)=>h==="/"?p==="/":p===h||p.startsWith(h+"/");const [open,setOpen]=useState<Record<string,boolean>>({});
 return <nav>{items.map(it=>{const ic=<svg className="ico" viewBox="0 0 24 24"><path d={P[it.i]}/></svg>;
  if(!it.ch)return <a key={it.l+it.h} href={it.h} className={on(it.h!)?"on":""}>{ic}{it.l}</a>;
  const best=it.ch.filter(c=>on(c.h)).sort((a,b)=>b.h.length-a.h.length)[0]?.h,act=!!best,o=open[it.l]??act;
  return <div key={it.l}><button type="button" className={"grp"+(act?" act":"")} onClick={()=>setOpen(s=>({...s,[it.l]:!o}))}>{ic}{it.l}<span className="chev">{o?"▾":"▸"}</span></button>{o&&<div className="sub">{it.ch.map(c=><a key={c.h} href={c.h} className={c.h===best?"on":""}>{c.l}</a>)}</div>}</div>})}</nav>}
