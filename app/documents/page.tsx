import Shell from "@/components/Shell"; import Badge from "@/components/Badge"; import {load} from "@/lib/db"; import {me} from "@/lib/auth"; import {involved} from "@/lib/scope";
export const dynamic="force-dynamic";
export default function P({searchParams}:any){const d=load();const u=me();const q=String(searchParams.q||"").toLowerCase();
 const recs=[...d.apps,...d.fss].filter((a:any)=>involved(a,u));const nm=(a:any)=>d.customers.find((c:any)=>c.id===a.cid)?.name||"";
 const docs:any[]=[];for(const a of recs)for(const [k,dc] of Object.entries(a.docs||{}) as [string,any][])if((a.kind==="fs")===(k==="fin"))docs.push({a,k,dc});
 const files:any[]=[];for(const a of recs)for(const x of a.files||[])files.push({a,x});
 const hit=(t:string)=>!q||t.toLowerCase().includes(q);
 const base=(a:any)=>(a.kind==="fs"?"/statements/":"/applications/")+a.id;
 return <Shell><h2>Documents</h2><form className="card"><div className="f"><label>Search (customer, reference, document)<input name="q" defaultValue={searchParams.q}/></label></div><button>Search</button></form>
 <div className="card"><h3>Generated documents</h3><table><thead><tr><th>Document</th><th>Job</th><th>Customer</th><th>Version</th><th>Status</th><th>Printing</th><th></th></tr></thead><tbody>
 {docs.filter(({a,dc})=>hit(dc.title+a.code+nm(a))).map(({a,k,dc})=><tr key={a.id+k}><td>{dc.title}</td><td><a href={base(a)}>{a.code}</a></td><td>{nm(a)}</td><td>v{dc.version}</td><td><Badge s={dc.status}/></td><td>{dc.printedVersion?`Printed v${dc.printedVersion}`:"Not printed"}</td><td><a href={`/doc/${a.id}/${k}`}>Preview</a></td></tr>)}</tbody></table>{!docs.length&&<p style={{color:"var(--mu)"}}>No documents yet. They are created when the Consultant approves a submitted job.</p>}</div>
 <div className="card"><h3>Supporting documents</h3><table><thead><tr><th>Type</th><th>File</th><th>Job</th><th>Customer</th><th>Uploaded</th></tr></thead><tbody>
 {files.filter(({a,x})=>hit(x.name+x.kind+a.code+nm(a))).map(({a,x})=><tr key={x.id}><td>{x.kind}</td><td><a href={"/api/file/"+x.id} target="_blank">{x.name}</a></td><td><a href={base(a)}>{a.code}</a></td><td>{nm(a)}</td><td>{x.by}<br/><small>{new Date(x.at).toLocaleDateString()}</small></td></tr>)}</tbody></table>{!files.length&&<p style={{color:"var(--mu)"}}>No supporting documents uploaded yet.</p>}</div></Shell>}
