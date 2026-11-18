"use client";
import {useState} from "react";
type R={d:string;q:string;p:string};
const num=(x:string)=>Number(String(x).replace(/,/g,""))||0;
const m=(n:number)=>n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
const parse=(s:string):R[]=>s.split("\n").map(l=>l.split("|").map(x=>x.trim())).filter(r=>r[0]).map(r=>({d:r[0],q:r[1]||"",p:r[2]||""}));
export default function UseOfFunds({initial,financing}:{initial:string;financing:number}){
 const [rows,setRows]=useState<R[]>(()=>{const r=parse(initial);return r.length?r:[{d:"",q:"",p:""},{d:"",q:"",p:""},{d:"",q:"",p:""}]});
 const upd=(i:number,k:keyof R,v:string)=>setRows(rs=>rs.map((r,j)=>j===i?{...r,[k]:v}:r));
 const total=rows.reduce((s,r)=>s+num(r.q)*num(r.p),0);
 const ser=rows.filter(r=>r.d.trim()).map(r=>`${r.d.trim().replace(/\|/g,"/")} | ${r.q} | ${r.p}`).join("\n");
 const diff=financing-total;
 return <div style={{marginBottom:12}}><b style={{color:"#164176"}}>Use of funds (optional)</b><p style={{margin:"2px 0 8px",color:"#5B6B80",fontSize:13}}>Add items only if you want them in the business plan. Total = quantity × unit price. Leave all rows empty to skip this table.</p>
 <input type="hidden" name="uof" value={ser}/>
 <table><thead><tr><th>Description</th><th style={{width:110}}>Qty</th><th style={{width:150}}>Unit price (ETB)</th><th style={{width:150}}>Total (ETB)</th><th style={{width:44}}></th></tr></thead><tbody>
 {rows.map((r,i)=><tr key={i}><td><input value={r.d} onChange={e=>upd(i,"d",e.target.value)} placeholder="e.g. Purchase of sugar"/></td><td><input type="number" step="any" value={r.q} onChange={e=>upd(i,"q",e.target.value)}/></td><td><input type="number" step="any" value={r.p} onChange={e=>upd(i,"p",e.target.value)}/></td>
 <td style={{textAlign:"right",paddingTop:14}}>{num(r.q)&&num(r.p)?m(num(r.q)*num(r.p)):"—"}</td><td><button type="button" className="gray" title="Remove row" onClick={()=>setRows(rs=>rs.filter((_,j)=>j!==i))}>✕</button></td></tr>)}
 <tr><td colSpan={3}><button type="button" className="btn ghost" onClick={()=>setRows(rs=>[...rs,{d:"",q:"",p:""}])}>+ Add row</button></td><td style={{textAlign:"right"}}><b>{m(total)}</b></td><td></td></tr></tbody></table>
 {total>0&&<p style={{margin:"6px 0 0",fontSize:13,color:Math.abs(diff)<0.5?"#15683A":"#8A5400"}}>{Math.abs(diff)<0.5?"Total matches the requested financing.":`Requested financing is ETB ${m(financing)}; difference ETB ${m(diff)}.`}</p>}</div>}
