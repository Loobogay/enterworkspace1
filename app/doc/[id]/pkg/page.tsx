import Shell from "@/components/Shell"; import {load,findRec} from "@/lib/db"; import {me} from "@/lib/auth"; import PrintBtn from "@/components/PrintBtn"; import DocView from "@/components/DocView";
export const dynamic="force-dynamic";
export default function P({params}:any){const u=me();const a=findRec(load(),params.id);const l=a?.docs?.letter,p=a?.docs?.plan;if(!l||!p)return <Shell>Not found</Shell>;
 const ok=l.status==="Approved"&&p.status==="Approved",can=ok&&u?.role==="Secretary";
 return <Shell><div className="noprint"><a href={(a.kind==="fs"?"/statements/":"/applications/")+a.id}>← Back</a> {can?<PrintBtn id={a.id} type="pkg"/>:<span className="warn">{ok?"Only the Secretary can print approved documents.":"Both the Request Letter and the Business Plan must be approved before printing the package."}</span>}</div>
 {!can&&<style>{"@media print{.paper{display:none}}"}</style>}<DocView a={a} dc={l} ok={ok}/><DocView a={a} dc={p} ok={ok}/></Shell>}
