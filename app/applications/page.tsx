import Shell from "@/components/Shell"; import Badge from "@/components/Badge"; import {load} from "@/lib/db"; import {me} from "@/lib/auth"; import {f} from "@/lib/calc";
export const dynamic="force-dynamic";
export default function P(){const d=load();const u=me();const L:any[]=d.apps;const can=["Secretary","Administrator"].includes(u?.role);
 return <Shell><h2>Financing Applications (Request Letter + Business Plan)</h2>
 {can&&<form className="card" action="/applications/new"><h3>Start a new financing application</h3><div className="f"><label>Customer<select name="cid" required>{d.customers.map((c:any)=><option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}</select></label></div>{d.customers.length?<button>Continue</button>:<p className="warn">Register a customer first (Customers menu).</p>}</form>}
 <div className="card"><table><thead><tr><th>Ref</th><th>Customer</th><th>Category</th><th>Amount (ETB)</th><th>Status</th></tr></thead><tbody>
 {L.map((a:any)=>{const c=d.customers.find((x:any)=>x.id===a.cid);return <tr key={a.id}><td><a href={"/applications/"+a.id}>{a.code}</a></td><td>{c?.name}</td><td>{a.btype}</td><td>{a.amount?f(a.amount):"—"}</td><td><Badge s={a.status}/></td></tr>})}</tbody></table>{!L.length&&<p style={{color:"#5B6B80"}}>Nothing here yet.</p>}</div></Shell>}
