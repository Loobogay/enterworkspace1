import Shell from "@/components/Shell"; import {load} from "@/lib/db"; import {need} from "@/lib/auth"; import {f} from "@/lib/calc"; import PrintBtn from "@/components/PrintBtn";
export const dynamic="force-dynamic";
export default function P({params}:any){const u=need("Secretary","Administrator","Audit");const d=load(),co=d.settings.company;const t=(d.ftx||[]).find((x:any)=>x.id===params.id&&x.type==="income");
 if(!t||(u.role==="Secretary"&&t.byId!==u.id))return <Shell>Receipt not found</Shell>;
 return <Shell><div className="noprint"><a href={u.role==="Secretary"?"/payments":"/finance"}>← Back</a> <PrintBtn/></div>
 <div className="paper"><div style={{display:"flex",alignItems:"center",gap:14,borderBottom:"3px solid var(--b)",paddingBottom:10}}><img src="/api/logo" alt="" style={{width:56}}/><div><b style={{fontSize:20,color:"#0D264C"}}>{co.name}</b><br/><small>{[co.address,co.phone,co.email].filter(Boolean).join(" · ")||"Payment receipt"}</small></div></div>
 {t.void&&<p style={{color:"#c0392b",fontWeight:700}}>VOIDED — {t.voidReason}</p>}
 <table><tbody><tr><td>Receipt no.</td><td><b>{t.rcpt}</b></td></tr><tr><td>Date</td><td>{t.date}</td></tr><tr><td>Received from</td><td>{t.party}</td></tr><tr><td>Payment for</td><td>{t.cat}{t.ref?` (${t.ref})`:""}</td></tr><tr><td>Method</td><td>{t.method}</td></tr><tr><td>Amount</td><td><b>ETB {f(t.amount)}</b></td></tr><tr><td>Received by</td><td>{t.by}</td></tr></tbody></table>
 {t.note&&<p>Note: {t.note}</p>}<p style={{marginTop:40}}>Signature: ______________________</p></div></Shell>}
