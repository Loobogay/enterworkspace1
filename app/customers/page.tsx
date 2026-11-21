import Shell from "@/components/Shell"; import Badge from "@/components/Badge"; import ConfirmButton from "@/components/ConfirmButton"; import {load} from "@/lib/db"; import {need} from "@/lib/auth"; import {deleteCustomer} from "../actions";
export const dynamic="force-dynamic";
const PER=15;
export default function P({searchParams}:any){const d=load();const u=need();const can=["Secretary","Administrator"].includes(u.role);const q=String(searchParams.q||"").toLowerCase().trim();
 const all=d.customers.filter((c:any)=>!q||[c.name,c.business,c.tin,c.code,c.mobile,c.address].join(" ").toLowerCase().includes(q)).sort((a:any,b:any)=>String(b.code).localeCompare(String(a.code)));
 const pages=Math.max(1,Math.ceil(all.length/PER)),pg=Math.min(pages,Math.max(1,+searchParams.page||1)),L=all.slice((pg-1)*PER,pg*PER);
 const jobs=(c:any)=>d.apps.filter((a:any)=>a.cid===c.id).length+d.fss.filter((a:any)=>a.cid===c.id).length;
 const link=(p:number)=>`/customers?${q?"q="+encodeURIComponent(q)+"&":""}page=${p}`;
 return <Shell><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10,marginBottom:14}}><h2 style={{margin:0}}>Customer List</h2>{can&&<a className="btn" href="/customers/new">+ Register customer</a>}</div>
 {searchParams.e&&<div className="err">{searchParams.e}</div>}{searchParams.ok&&<div className="warn" style={{background:"#DDF3E6",borderColor:"#9ED3B2",color:"#15683A"}}>{searchParams.ok}</div>}
 <form className="card"><div className="f"><label>Search (name, business, TIN, mobile, ID)<input name="q" defaultValue={searchParams.q}/></label></div><button>Search</button> {q&&<a className="btn ghost" href="/customers">Clear</a>}</form>
 <div className="card"><p style={{margin:"0 0 10px",color:"var(--mu)"}}>{all.length} customer{all.length===1?"":"s"}{q?" found":""}</p><table><thead><tr><th>ID</th><th>Name</th><th>Business</th><th>TIN</th><th>Mobile</th><th>Account</th><th>Jobs</th><th style={{width:210}}>Actions</th></tr></thead><tbody>
 {L.map((c:any)=><tr key={c.id}><td>{c.code}</td><td><a href={"/customers/"+c.id}><b>{c.name}</b></a></td><td>{c.business}</td><td>{c.tin}</td><td>{c.mobile}</td><td>{c.accountMasked}</td><td>{jobs(c)}</td>
 <td style={{whiteSpace:"nowrap"}}><a href={"/customers/"+c.id}>View</a>{can&&<> · <a href={"/customers/"+c.id+"/edit"}>Edit</a> · <form action={deleteCustomer} style={{display:"inline"}}><input type="hidden" name="id" value={c.id}/><ConfirmButton msg={"Delete "+c.name+"? This cannot be undone."} className="linkbtn">Delete</ConfirmButton></form></>}</td></tr>)}</tbody></table>
 {!L.length&&<p style={{color:"var(--mu)"}}>{q?"No customer matches your search.":"No customers registered yet."}</p>}
 {pages>1&&<p style={{marginBottom:0}}>{pg>1&&<a href={link(pg-1)}>← Previous</a>} Page {pg} of {pages} {pg<pages&&<a href={link(pg+1)}>Next →</a>}</p>}</div></Shell>}
