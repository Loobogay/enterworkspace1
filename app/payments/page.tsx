import Shell from "@/components/Shell"; import {load} from "@/lib/db"; import {me,need} from "@/lib/auth"; import {f} from "@/lib/calc"; import {addTx} from "../actions"; import {redirect} from "next/navigation"; import PayFields from "@/components/PayFields";
export const dynamic="force-dynamic";
const CATS=["Request Letter + Business Plan fee","Financial Statements fee","Other document fee"];
export default function P({searchParams}:any){if(["Administrator","Audit"].includes(me()?.role))redirect("/finance");const u=need("Secretary");const d=load();const today=new Date().toISOString().slice(0,10);
 const jobs=[...d.apps,...d.fss];const mine=(d.ftx||[]).filter((x:any)=>x.type==="income"&&x.byId===u.id&&!x.void).slice(-20).reverse();
 return <Shell><h2>Payments received for documents</h2>{searchParams.e&&<div className="err">{searchParams.e}</div>}{searchParams.ok&&<div className="warn" style={{background:"#DDF3E6",borderColor:"#9ED3B2",color:"#15683A"}}>{searchParams.ok}</div>}
 <form className="card" action={addTx}><input type="hidden" name="type" value="income"/><h3>Record a payment</h3><div className="f">
 <label>Customer *<select name="cid" required><option value="">— choose —</option>{d.customers.map((c:any)=><option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}</select></label>
 <label>Document job (optional)<select name="ref"><option value="">— none —</option>{jobs.map((j:any)=><option key={j.id} value={j.id}>{j.code} — {d.customers.find((c:any)=>c.id===j.cid)?.name}</option>)}</select></label>
 <PayFields services={d.settings.services.map((s:any)=>({name:s.name,price:+s.price||0}))}/>
 <label>Date<input type="date" name="date" defaultValue={today} required/></label><label>Method<select name="method">{d.settings.lists.methods.map((m:string)=><option key={m}>{m}</option>)}</select></label></div>
 <label>Note / reference<input name="note"/></label><br/><button className="grn">Save payment and issue receipt</button></form>
 <div className="card"><h3>Payments you recorded (latest 20)</h3><table><thead><tr><th>Receipt</th><th>Date</th><th>Customer</th><th>For</th><th>Amount (ETB)</th><th></th></tr></thead><tbody>
 {mine.map((x:any)=><tr key={x.id}><td>{x.rcpt}</td><td>{x.date}</td><td>{x.party}</td><td>{x.cat}{x.ref&&<><br/><small>{x.ref}</small></>}</td><td>{f(x.amount)}</td><td><a href={"/receipt/"+x.id}>Print receipt</a></td></tr>)}</tbody></table>{!mine.length&&<p style={{color:"#5B6B80"}}>No payments recorded yet.</p>}</div></Shell>}
