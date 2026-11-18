import Shell from "@/components/Shell"; import CustomerForm from "@/components/CustomerForm"; import {load} from "@/lib/db"; import {need} from "@/lib/auth"; import {addCustomer} from "../../actions";
export const dynamic="force-dynamic";
export default function P({searchParams}:any){need("Secretary","Administrator");const d=load();
 return <Shell><h2>Customer Registration</h2>{searchParams.e&&<div className="err">{searchParams.e}</div>}<CustomerForm action={addCustomer} ownership={d.settings.lists.ownership} submit="Register customer"/></Shell>}
