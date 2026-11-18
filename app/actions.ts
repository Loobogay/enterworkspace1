"use server";
import {redirect} from "next/navigation"; import {revalidatePath} from "next/cache";
import {load,save,uid,verify,enc,findRec,hash,putFile,delFile} from "@/lib/db"; import {parseFs} from "@/lib/xl"; import {me,setSession,clearSession,need} from "@/lib/auth"; import {gen,genFs} from "@/lib/docs"; import {PURPOSE} from "@/lib/plan"; const mk=(a:any,c:any):any=>a.kind==="fs"?genFs(a,c):gen(a,c); import {refresh} from "@/lib/docflow"; import {aiText,aiPing,AI_FIELDS} from "@/lib/ai"; import {notify,userIdByName,recHref} from "@/lib/notify"; import {terms} from "@/lib/calc";
const s=(f:FormData,k:string)=>String(f.get(k)||"").trim(); const n=(f:FormData,k:string)=>Number(s(f,k).replace(/,/g,""))||0;
const log=(d:any,u:any,a:string,ref="")=>d.log.unshift({t:new Date().toISOString(),u:u.name,a,ref});
export async function login(f:FormData){const d=load();const u=d.users.find((x:any)=>x.username===s(f,"u")&&x.active);
  if(!u||!verify(s(f,"p"),u.hash)){redirect("/login?e=1")} setSession(u.id);redirect("/")}
export async function logout(){clearSession();redirect("/login")}
export async function addUser(f:FormData){const u=need("Administrator");const d=load();const un=s(f,"username");
  if(!un||!s(f,"password")||d.users.some((x:any)=>x.username===un))redirect("/admin?e=1");
  d.users.push({id:uid(),username:un,name:s(f,"name"),role:["Secretary","Consultant","Administrator","Audit"].includes(s(f,"role"))?s(f,"role"):"Secretary",active:true,hash:hash(s(f,"password"))});log(d,u,"Created user "+un);save(d);redirect("/admin")}
export async function toggleUser(f:FormData){const u=need("Administrator");const d=load();const x=d.users.find((y:any)=>y.id===s(f,"id"));if(x&&x.id!==u.id){x.active=!x.active;log(d,u,"Toggled user "+x.username);save(d)}redirect("/admin")}
const custFields=(f:FormData)=>({name:s(f,"name"),business:s(f,"business"),tin:s(f,"tin"),mobile:s(f,"mobile"),email:s(f,"email"),address:s(f,"address"),ownership:s(f,"ownership")||"Sole proprietorship",established:s(f,"established"),holder:s(f,"holder")});
export async function addCustomer(f:FormData){const u=need("Secretary","Administrator");const d=load();const v=custFields(f),acct=s(f,"acct");
  if(!v.name||!v.tin||!v.mobile||!acct||!v.holder)redirect("/customers/new?e=Name, TIN, mobile, account holder and account number are required");
  if(d.customers.some((x:any)=>x.tin===v.tin))redirect("/customers/new?e=A customer with this TIN already exists");
  const num=d.customers.reduce((m:number,x:any)=>Math.max(m,parseInt(String(x.code).replace(/\D/g,""))||0),0)+1;
  const c:any={...v,id:uid(),code:"CUS-"+String(num).padStart(4,"0"),accountEnc:enc(acct),accountMasked:"****"+acct.slice(-4),by:u.name,at:new Date().toISOString()};
  d.customers.push(c);log(d,u,"Registered customer",c.code);save(d);redirect("/customers/"+c.id+"?ok=Customer registered")}
export async function updateCustomer(f:FormData){const u=need("Secretary","Administrator");const d=load();const c=d.customers.find((x:any)=>x.id===s(f,"id"));if(!c)redirect("/customers");
  const back="/customers/"+c.id+"/edit",v=custFields(f),acct=s(f,"acct");
  if(!v.name||!v.tin||!v.mobile||!v.holder)redirect(back+"?e=Name, TIN, mobile and account holder are required");
  if(d.customers.some((x:any)=>x.id!==c.id&&x.tin===v.tin))redirect(back+"?e=A different customer already has this TIN");
  Object.assign(c,v);if(acct){c.accountEnc=enc(acct);c.accountMasked="****"+acct.slice(-4)}
  c.updatedBy=u.name;c.updatedAt=new Date().toISOString();log(d,u,"Updated customer",c.code);save(d);redirect("/customers/"+c.id+"?ok=Customer updated")}
export async function deleteCustomer(f:FormData){const u=need("Secretary","Administrator");const d=load();const c=d.customers.find((x:any)=>x.id===s(f,"id"));if(!c)redirect("/customers");
  const back="/customers/"+c.id;
  if(u.role==="Secretary"&&c.by!==u.name)redirect(back+"?e=You can delete only customers you registered");
  const jobs=d.apps.filter((a:any)=>a.cid===c.id).length+d.fss.filter((a:any)=>a.cid===c.id).length,pays=d.ftx.filter((x:any)=>x.cid===c.id).length;
  if(jobs||pays)redirect(back+"?e="+encodeURIComponent(`This customer cannot be deleted because it is linked to ${jobs} job(s) and ${pays} payment record(s). Records that were used are kept for the audit trail.`));
  d.customers=d.customers.filter((x:any)=>x.id!==c.id);log(d,u,"Deleted customer "+c.name,c.code);save(d);redirect("/customers?ok=Customer deleted")}
export async function addApp(f:FormData){const u=need("Secretary","Administrator");const d=load();const c=d.customers.find((x:any)=>x.id===s(f,"cid"));if(!c)redirect("/customers");
  const a:any={id:uid(),code:"APP-"+new Date().getFullYear()+"-"+String(d.apps.length+1).padStart(4,"0"),cid:c.id,bank:s(f,"bank"),branch:s(f,"branch"),bankStatus:s(f,"bankStatus"),amount:n(f,"amount"),equity:n(f,"equity"),markup:n(f,"markup"),freq:s(f,"freq"),months:n(f,"months"),btype:s(f,"btype"),purpose:PURPOSE[s(f,"btype")]||PURPOSE.Other,purposeAuto:true,background:"",products:"",status:"Draft",by:u.name,at:new Date().toISOString(),history:[]};
  d.apps.push(a);log(d,u,"Created application",a.code);save(d);redirect("/applications/"+a.id)}
const getApp=(d:any,f:FormData)=>findRec(d,s(f,"id"));
export async function saveFin(f:FormData){const u=need("Secretary","Consultant","Administrator");const d=load();const a=getApp(d,f);if(!a)redirect("/");
  if(a.kind!=="fs")redirect("/applications/"+a.id);
  const draft=["Draft","Returned for Correction"].includes(a.status);
  const adj=u.role==="Consultant"&&(a.status==="Pending Consultant Approval"||(a.docs&&a.docs.fin.status!=="Approved"));
  if(!((u.role!=="Consultant"&&draft)||adj))redirect("/applications/"+a.id+"?e=Figures cannot be edited at this stage");
  if(adj&&!s(f,"note"))redirect("/applications/"+a.id+"?e=Give the reason or evidence for the adjustment");
  const o:any={end:s(f,"end"),taxRate:s(f,"taxRate")===""?30:n(f,"taxRate"),source:adj?"Consultant adjusted":s(f,"source"),note:s(f,"note"),cur:{},prev:{},by:u.name};
  for(const k of["rev","cogs","sal","ga","dep","cash","inv","rec","prep","equip","onc","pay","capital","ret"]){o.cur[k]=n(f,"c_"+k);o.prev[k]=n(f,"p_"+k)}
  a.fin=o;a.bank=s(f,"bank");
  if(a.docs){const g=mk(a,d.customers.find((x:any)=>x.id===a.cid));a.docs.fin={...g.fin,version:a.docs.fin.version+1};a.history.push({t:new Date().toISOString(),u:u.name,a:"Adjusted financial figures",c:o.note});refresh(a)}
  log(d,u,"Saved financial figures",a.code);save(d);redirect("/applications/"+a.id)}
export async function submitApp(f:FormData){const u=need("Secretary","Administrator");const d=load();const a=getApp(d,f);
  if(!a||!["Draft","Returned for Correction"].includes(a.status))redirect("/");
  const t=terms(a);const miss=[];if(a.kind==="fs"){if(!(+a.fin?.cur?.rev>0))miss.push("current-year sales revenue (enter the financial figures first)")}else{if(t.amt<=0)miss.push("financing amount");if(!a.purpose)miss.push("purpose");if(t.n<=0)miss.push("period");if(!a.bank||!a.branch)miss.push("bank/branch");if(!a.markup)miss.push("markup");}
  if(miss.length)redirect("/applications/"+a.id+"?e=Missing: "+miss.join(", "));
  a.status="Pending Consultant Approval";a.history.push({t:new Date().toISOString(),u:u.name,a:"Submitted"});log(d,u,"Submitted",a.code);notify(d,{role:"Consultant",text:a.code+" was submitted for your approval",href:recHref(a)});save(d);redirect("/applications/"+a.id)}
export async function decide(f:FormData){const u=need("Consultant");const d=load();const a=getApp(d,f);const act=s(f,"act"),cm=s(f,"comment");
  if(!a||a.status!=="Pending Consultant Approval")redirect("/");
  if(act!=="approve"&&!cm)redirect("/applications/"+a.id+"?e=A comment is required");
  const c=d.customers.find((x:any)=>x.id===a.cid);
  a.history.push({t:new Date().toISOString(),u:u.name,a:act,c:cm});
  if(act==="approve"){a.status="Data Approved";a.approvedBy=u.name;a.docs=mk(a,c);a.status="Pending Final Approval"}
  else a.status=act==="return"?"Returned for Correction":"Rejected";
  log(d,u,"Application "+act,a.code);notify(d,{user:userIdByName(d,a.by),text:act==="approve"?a.code+" was approved. The documents are ready for review.":a.code+(act==="return"?" was returned: ":" was rejected: ")+cm,href:recHref(a)});save(d);redirect("/applications/"+a.id)}
export async function editDoc(f:FormData){const u=need("Consultant");const d=load();const a=getApp(d,f);const dc=a?.docs?.[s(f,"type")];if(!dc)redirect("/");
  dc.sections.forEach((x:any,i:number)=>{if(x.p!==undefined&&f.has("s"+i))x.p=String(f.get("s"+i))});dc.version++;dc.status="Pending Review";dc.approvedVersion=undefined;refresh(a);
  log(d,u,"Edited "+dc.title+" -> v"+dc.version,a.code);save(d);redirect("/applications/"+a.id)}
export async function regen(f:FormData){const u=need("Consultant");const d=load();const a=getApp(d,f);if(!a?.docs)redirect("/");
  const c=d.customers.find((x:any)=>x.id===a.cid);const g=mk(a,c);for(const k of Object.keys(g)){g[k].version=a.docs[k].version+1}a.docs=g;refresh(a);log(d,u,"Regenerated documents",a.code);save(d);redirect("/applications/"+a.id)}
export async function reviewDoc(f:FormData){const u=need("Consultant");const d=load();const a=getApp(d,f);const dc=a?.docs?.[s(f,"type")];if(!dc)redirect("/");
  const act=s(f,"act"),cm=s(f,"comment");if(act==="approve"&&dc.status==="Returned by Customer")redirect("/applications/"+a.id+"?e=Edit the document first and save a new version, then approve it");if(act==="return"&&!cm)redirect("/applications/"+a.id+"?e=A comment is required");
  dc.status=act==="approve"?"Approved":"Returned for Correction";dc.approvedVersion=act==="approve"?dc.version:undefined;a.history.push({t:new Date().toISOString(),u:u.name,a:`${act} ${dc.title} v${dc.version}`,c:cm});
  refresh(a);
  log(d,u,`${act} ${dc.title} v${dc.version}`,a.code);notify(d,{user:userIdByName(d,a.by),text:act==="approve"?`${dc.title} v${dc.version} approved`+(a.status==="Ready for Printing"?` — ${a.code} is ready for printing`:""):`${dc.title} was returned for correction: ${cm}`,href:recHref(a)});save(d);redirect("/applications/"+a.id)}
export async function archive(f:FormData){const u=need("Consultant","Administrator");const d=load();const a=getApp(d,f);if(a?.status==="Ready for Printing"||a?.status==="Printed"){a.status="Archived";log(d,u,"Archived",a.code);save(d)}redirect("/applications/"+s(f,"id"))}
export async function addTx(f:FormData){const type=s(f,"type");const u=need(type==="income"?"Secretary":"Administrator");const d=load();d.ftx=d.ftx||[];
  const back=type==="income"?"/payments":"/finance";const amt=n(f,"amount"),dt=s(f,"date");
  if(!(amt>0)||!dt||!["income","expense"].includes(type))redirect(back+"?e=Date and a positive amount are required");
  const c=d.customers.find((x:any)=>x.id===s(f,"cid"));
  if(type==="income"&&!c)redirect("/payments?e=Choose the customer who paid");
  let ref="";const rr=s(f,"ref")?findRec(d,s(f,"ref")):null;
  if(rr){if(rr.cid!==c?.id)redirect("/payments?e=That reference belongs to a different customer");ref=rr.code}
  const t:any={id:uid(),type,date:dt,party:c?c.name:s(f,"party"),cid:c?.id||"",cat:s(f,"cat"),amount:amt,method:s(f,"method"),note:s(f,"note"),ref,by:u.name,byId:u.id,at:new Date().toISOString(),void:false};
  if(type==="income")t.rcpt="RCT-"+dt.slice(0,4)+"-"+String(d.ftx.filter((x:any)=>x.type==="income").length+1).padStart(4,"0");
  d.ftx.push(t);log(d,u,`Recorded ${type} ETB ${amt}`,t.rcpt||dt);if(type==="income")notify(d,{role:"Administrator",text:`Payment received: ETB ${amt.toLocaleString("en-US")} from ${t.party} (${t.rcpt})`,href:"/finance?month="+dt.slice(0,7)});save(d);
  redirect(type==="income"?"/payments?ok="+encodeURIComponent("Payment recorded. Receipt "+t.rcpt):"/finance?month="+dt.slice(0,7))}
export async function voidTx(f:FormData){const u=need("Administrator");const d=load();const t=(d.ftx||[]).find((x:any)=>x.id===s(f,"id"));
  if(!t||!s(f,"reason"))redirect("/finance?e=A reason is required to void a record");
  t.void=true;t.voidBy=u.name;t.voidReason=s(f,"reason");log(d,u,`Voided ${t.type} ETB ${t.amount}`,s(f,"reason"));save(d);redirect("/finance?month="+t.date.slice(0,7))}
export async function customerReturn(f:FormData){const u=need("Secretary");const d=load();const a=getApp(d,f);const dc=a?.docs?.[s(f,"type")];const why=s(f,"reason");
  if(!dc||dc.status!=="Approved")redirect("/applications/"+s(f,"id"));
  if(!why)redirect("/applications/"+a.id+"?e=Write what the customer wants changed");
  dc.status="Returned by Customer";dc.approvedVersion=undefined;a.history.push({t:new Date().toISOString(),u:u.name,a:`Customer returned ${dc.title} v${dc.version}`,c:why});
  refresh(a);log(d,u,"Customer returned "+dc.title,a.code);notify(d,{role:"Consultant",text:`${a.code}: the customer returned ${dc.title} — ${why}`,href:recHref(a)});save(d);redirect("/applications/"+a.id)}
export async function savePlan(f:FormData){const u=need("Secretary","Consultant","Administrator");const d=load();const a=getApp(d,f);if(!a)redirect("/");
  const draft=["Draft","Returned for Correction"].includes(a.status);
  const adj=u.role==="Consultant"&&(a.status==="Pending Consultant Approval"||(a.docs&&a.docs.plan.status!=="Approved"));
  if(a.kind==="fs")redirect("/statements/"+a.id);if(!((u.role!=="Consultant"&&draft)||adj))redirect("/applications/"+a.id+"?e=Plan inputs cannot be edited at this stage");
  a.plan={useOfFunds:String(f.get("uof")||""),mSales:n(f,"mSales"),mCogs:n(f,"mCogs"),mOpex:n(f,"mOpex"),hours:s(f,"hours"),staff:s(f,"staff")};a.products=String(f.get("products")||"");{const pu=s(f,"purpose");if(pu&&pu!==a.purpose){a.purpose=pu;a.purposeAuto=false}}a.background=String(f.get("background")||"");
  if(a.docs){const g=mk(a,d.customers.find((x:any)=>x.id===a.cid));a.docs.plan={...g.plan,version:a.docs.plan.version+1};a.history.push({t:new Date().toISOString(),u:u.name,a:"Updated business plan inputs"});refresh(a)}
  log(d,u,"Saved business plan inputs",a.code);save(d);redirect("/applications/"+a.id)}
export async function fsAdd(f:FormData){const u=need("Secretary","Administrator");const d=load();const c=d.customers.find((x:any)=>x.id===s(f,"cid"));if(!c)redirect("/customers");
  const r:any={id:uid(),kind:"fs",code:"FS-"+new Date().getFullYear()+"-"+String(d.fss.length+1).padStart(4,"0"),cid:c.id,btype:s(f,"btype"),bank:s(f,"bank"),status:"Draft",by:u.name,at:new Date().toISOString(),history:[]};
  d.fss.push(r);log(d,u,"Created financial statements job",r.code);save(d);redirect("/statements/"+r.id)}
export async function aiImprove(f:FormData){const u=need("Consultant");const d=load();const a=getApp(d,f);const dc=a?.docs?.plan;const back="/applications/"+s(f,"id");
  if(!dc||a.kind==="fs"||dc.status==="Approved")redirect(back+"?e=AI can only be used on a Business Plan that is not approved yet");
  const c=d.customers.find((x:any)=>x.id===a.cid);
  const r=await aiText({businessCategory:a.btype,location:c?.address||"",purposeOfFinancing:a.purpose,products:a.products||undefined,background:a.background||undefined});
  if(!r.ok)redirect(back+"?e="+encodeURIComponent((r as any).error));
  const nm=c.business||c.name;let n=0;const kept:string[]=[];
  for(const [k,head] of AI_FIELDS){const sec=dc.sections.find((x:any)=>x.h.startsWith(head));const t=(r as any).data[k];if(sec&&t){sec.p=t.split("{BUSINESS}").join(nm);n++}else kept.push(head)}
  if(!n)redirect(back+"?e="+encodeURIComponent("The AI text was not usable (it must not contain numbers). The template text was kept."));
  dc.version++;dc.status="Pending Review";dc.approvedVersion=undefined;dc.ai=true;refresh(a);
  a.history.push({t:new Date().toISOString(),u:u.name,a:"AI-assisted text generated for the Business Plan ("+(r as any).via+")",c:n+" sections rewritten; review required"});log(d,u,"AI-assisted business plan text",a.code);save(d);
  redirect(back+"?ok="+encodeURIComponent(n+" sections were rewritten by AI ("+(r as any).via+")"+(kept.length?" ("+kept.length+" kept from the template)":"")+". Please read them before approving."))}
export async function changePassword(f:FormData){const u=need();const d=load();const x=d.users.find((y:any)=>y.id===u.id);
  const cur=String(f.get("cur")||""),nw=String(f.get("nw")||""),cf=String(f.get("cf")||"");
  if(!verify(cur,x.hash))redirect("/account?e=Your current password is not correct");
  if(nw.length<8)redirect("/account?e=The new password must have at least 8 characters");
  if(nw!==cf)redirect("/account?e=The two new passwords do not match");
  if(nw===cur)redirect("/account?e=The new password must be different from the current one");
  x.hash=hash(nw);log(d,u,"Changed own password");save(d);redirect("/account?ok=Password changed")}
export async function resetPassword(f:FormData){const u=need("Administrator");const d=load();const x=d.users.find((y:any)=>y.id===s(f,"id"));const nw=String(f.get("nw")||"");
  if(!x||nw.length<8)redirect("/admin?e=The new password must have at least 8 characters");
  x.hash=hash(nw);log(d,u,"Reset password for "+x.username);save(d);redirect("/admin?ok=Password reset for "+x.username)}
const EXT:any={pdf:"application/pdf",jpg:"image/jpeg",jpeg:"image/jpeg",png:"image/png",docx:"application/vnd.openxmlformats-officedocument.wordprocessingml.document",xlsx:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"};
const magic=(e:string,b:Buffer)=>e==="pdf"?b.subarray(0,4).toString()==="%PDF":e==="png"?b[0]===0x89&&b[1]===0x50:(e==="jpg"||e==="jpeg")?b[0]===0xff&&b[1]===0xd8:(b[0]===0x50&&b[1]===0x4b);
const back=(a:any)=>(a.kind==="fs"?"/statements/":"/applications/")+a.id;
export async function uploadFile(f:FormData){const u=need("Secretary","Consultant","Administrator");const d=load();const a=getApp(d,f);if(!a)redirect("/");
  const file=f.get("file") as File|null;if(!file||!file.size)redirect(back(a)+"?e=Choose a file first");
  if(file.size>5*1024*1024)redirect(back(a)+"?e=The file is larger than 5 MB");
  const ext=(file.name.split(".").pop()||"").toLowerCase();if(!EXT[ext])redirect(back(a)+"?e=Allowed files: PDF, JPG, PNG, DOCX, XLSX");
  const buf=Buffer.from(await file.arrayBuffer());if(!magic(ext,buf))redirect(back(a)+"?e=The file content does not match its type");
  const id=uid(),name=file.name.replace(/[^\w.\- ]/g,"_").slice(-80);await putFile(id,buf);
  (a.files=a.files||[]).push({id,name,mime:EXT[ext],size:buf.length,kind:s(f,"kind")||"Other",by:u.name,at:new Date().toISOString()});log(d,u,"Uploaded "+name,a.code);save(d);redirect(back(a)+"?ok=File uploaded")}
export async function removeFile(f:FormData){const u=need("Secretary","Consultant","Administrator");const d=load();const a=getApp(d,f);if(!a)redirect("/");
  const x=(a.files||[]).find((y:any)=>y.id===s(f,"fid"));if(x){a.files=a.files.filter((y:any)=>y.id!==x.id);await delFile(x.id);log(d,u,"Removed file "+x.name,a.code);save(d)}redirect(back(a))}
export async function importFs(f:FormData){const u=need("Secretary","Consultant","Administrator");const d=load();const a=getApp(d,f);if(!a||a.kind!=="fs")redirect("/");
  const draft=["Draft","Returned for Correction"].includes(a.status);const adj=u.role==="Consultant"&&(a.status==="Pending Consultant Approval"||(a.docs&&a.docs.fin.status!=="Approved"));
  if(!((u.role!=="Consultant"&&draft)||adj))redirect(back(a)+"?e=Figures cannot be changed at this stage");
  if(adj&&!s(f,"note"))redirect(back(a)+"?e=Give the reason or evidence for the adjustment");
  const file=f.get("file") as File|null;if(!file||!file.size||!/\.xlsx$/i.test(file.name)||file.size>2*1024*1024)redirect(back(a)+"?e=Choose an .xlsx file of up to 2 MB");
  const buf=Buffer.from(await file.arrayBuffer());if(!magic("xlsx",buf))redirect(back(a)+"?e=This is not a valid Excel (.xlsx) file");
  let r:any;try{r=await parseFs(buf)}catch{redirect(back(a)+"?e=The Excel file could not be read")}
  if(!r||r.matched<5)redirect(back(a)+"?e=The file was not recognised. Download the template and keep its labels in column A");
  const o:any={end:r.end||a.fin?.end||"",taxRate:r.taxRate??a.fin?.taxRate??30,source:adj?"Consultant adjusted":"Customer provided",note:adj?s(f,"note"):(a.fin?.note||""),cur:{...(a.fin?.cur||{}),...r.cur},prev:{...(a.fin?.prev||{}),...r.prev},by:u.name};
  a.fin=o;if(a.docs){const g=mk(a,d.customers.find((x:any)=>x.id===a.cid));a.docs.fin={...g.fin,version:a.docs.fin.version+1};a.history.push({t:new Date().toISOString(),u:u.name,a:"Imported financial figures from Excel",c:o.note});refresh(a)}
  log(d,u,"Imported financial figures from Excel",a.code);save(d);redirect(back(a)+"?ok="+encodeURIComponent("Imported "+r.matched+" lines from Excel. Check the figures below."))}
export async function aiTest(){need("Administrator");const out=await aiPing();redirect("/admin?ok="+encodeURIComponent("AI test: "+out.join(" • ")))}
export async function saveService(f:FormData){const u=need("Administrator");const d=load();const sv=d.settings.services;const id=s(f,"id"),name=s(f,"name");
  if(!name)redirect("/settings/services?e=Service name is required");const o={name,desc:s(f,"desc"),price:n(f,"price")};
  if(id){const x=sv.find((y:any)=>y.id===id);if(x)Object.assign(x,o)}else sv.push({id:uid(),...o});log(d,u,"Saved service "+name);save(d);redirect("/settings/services")}
export async function deleteService(f:FormData){const u=need("Administrator");const d=load();const x=d.settings.services.find((y:any)=>y.id===s(f,"id"));
  if(x){d.settings.services=d.settings.services.filter((y:any)=>y.id!==x.id);log(d,u,"Deleted service "+x.name);save(d)}redirect("/settings/services")}
export async function saveCompany(f:FormData){const u=need("Administrator");const d=load();const c=d.settings.company;const pr=s(f,"primary"),name=s(f,"name");
  if(!/^#[0-9a-fA-F]{6}$/.test(pr)||!name)redirect("/settings/company?e=Enter the company name and choose a valid colour");
  Object.assign(c,{name,tagline:s(f,"tagline"),slogan:s(f,"slogan"),address:s(f,"address"),phone:s(f,"phone"),email:s(f,"email"),primary:pr});
  if(s(f,"removeLogo")==="1"&&c.logo){await delFile(c.logo.id);c.logo=null}
  const file=f.get("logo") as File|null;
  if(file&&file.size){if(file.size>1024*1024)redirect("/settings/company?e=The logo is larger than 1 MB");
    const b=Buffer.from(await file.arrayBuffer());let mime="";if(b[0]===0x89&&b[1]===0x50)mime="image/png";else if(b[0]===0xff&&b[1]===0xd8)mime="image/jpeg";else if(b.subarray(0,4).toString()==="RIFF"&&b.subarray(8,12).toString()==="WEBP")mime="image/webp";
    if(!mime)redirect("/settings/company?e=The logo must be a PNG, JPG or WebP image");
    if(c.logo)await delFile(c.logo.id);const id="logo-"+uid();await putFile(id,b);c.logo={id,mime}}
  log(d,u,"Updated company profile");save(d);redirect("/settings/company?ok=Company profile saved")}
const LISTS=["banks","categories","ownership","methods","expenseCats","docTypes"];
export async function saveList(f:FormData){const u=need("Administrator");const d=load();const k=s(f,"key");if(!LISTS.includes(k))redirect("/settings/dropdowns");
  const items=[...new Set(String(f.get("items")||"").split("\n").map(x=>x.trim().slice(0,80)).filter(Boolean))].slice(0,60);
  if(!items.length)redirect("/settings/dropdowns?e=A list needs at least one item");
  d.settings.lists[k]=items;log(d,u,"Updated dropdown list "+k);save(d);redirect("/settings/dropdowns?ok=Saved")}
