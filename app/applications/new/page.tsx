import Shell from "@/components/Shell"; import {load} from "@/lib/db"; import {addApp} from "../../actions"; import {need} from "@/lib/auth";
export const dynamic="force-dynamic";
export default function P({searchParams}:any){need("Secretary","Administrator");const d=load();const c=d.customers.find((x:any)=>x.id===searchParams.cid);if(!c)return <Shell>Customer not found</Shell>;
 return <Shell><h2>New financing application (Request Letter + Business Plan) — {c.name}</h2><form className="card" action={addApp}><input type="hidden" name="cid" value={c.id}/><div className="f">
 <label>Target bank<select name="bank">{d.settings.lists.banks.map((b:string)=><option key={b}>{b}</option>)}</select></label><label>Branch<input name="branch" required/></label>
 <label>Customer status at bank<select name="bankStatus"><option>Existing</option><option>New</option></select></label>
 <label>Requested financing (ETB)<input name="amount" type="number" step="0.01" required/></label><label>Customer equity (ETB)<input name="equity" type="number" step="0.01" required/></label>
 <label>Markup %<input name="markup" type="number" step="0.01" required/></label><label>Repayment frequency<select name="freq"><option>Monthly</option><option>Quarterly</option></select></label>
 <label>Financing period (months)<input name="months" type="number" required/></label><label>Business category<select name="btype">{d.settings.lists.categories.map(x=><option key={x}>{x}</option>)}</select></label></div>
 <p className="warn">The financing purpose, business background, products, Request Letter and Business Plan are written automatically from the business category and the figures above. The Consultant can edit the text before approval.</p><button>Create draft</button></form></Shell>}
