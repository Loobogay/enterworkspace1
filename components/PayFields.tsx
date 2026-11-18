"use client";
import {useState} from "react";
export default function PayFields({services}:{services:{name:string;price:number}[]}){const [amt,setAmt]=useState(services[0]?.price?String(services[0].price):"");
 return <><label>Payment for<select name="cat" onChange={e=>{const s=services.find(x=>x.name===e.target.value);if(s&&s.price>0)setAmt(String(s.price))}}>{services.map(s=><option key={s.name}>{s.name}</option>)}<option>Other</option></select></label><label>Amount (ETB) *<input name="amount" type="number" step="0.01" required value={amt} onChange={e=>setAmt(e.target.value)}/></label></>}
