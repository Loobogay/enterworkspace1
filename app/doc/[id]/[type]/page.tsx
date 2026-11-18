import Shell from "@/components/Shell"; import {load,findRec} from "@/lib/db"; import {me} from "@/lib/auth"; import PrintBtn from "@/components/PrintBtn"; import DocView from "@/components/DocView";
export const dynamic="force-dynamic";
export default function P({params}:any){const u=me();const a=findRec(load(),params.id);const dc=a?.docs?.[params.type];if(!dc)return <Shell>Not found</Shell>;
 const ok=dc.status==="Approved",can=ok&&u?.role==="Secretary";
 return <Shell><div className="noprint"><a href={(a.kind==="fs"?"/statements/":"/applications/")+a.id}>← Back</a> {can?<PrintBtn id={a.id} type={params.type}/>:<span className="warn">{ok?"Only the Secretary can print approved documents.":"DRAFT — not approved. Printing is blocked."}</span>}</div>
 {!can&&<style>{"@media print{.paper{display:none}}"}</style>}<DocView a={a} dc={dc} ok={ok}/></Shell>}
