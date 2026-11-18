// Application status is always derived from its document statuses
export function refresh(a:any){const ds=Object.entries(a.docs||{}).filter(([k])=>a.kind==="fs"?k==="fin":k!=="fin").map(([,v])=>v) as any[];if(!ds.length)return;
  if(ds.some(x=>x.status==="Returned by Customer"))a.status="Customer Revision";
  else if(ds.some(x=>x.status==="Returned for Correction"))a.status="Returned for Document Correction";
  else if(ds.every(x=>x.status==="Approved"))a.status=ds.every(x=>x.printedVersion===x.approvedVersion)?"Printed":"Ready for Printing";
  else a.status="Pending Final Approval"}
export function logPrint(a:any,type:string,u:any,kind:string){const dc=a.docs[type];dc.printedVersion=dc.version;dc.printedAt=new Date().toISOString();
  (a.prints=a.prints||[]).unshift({t:dc.printedAt,u:u.name,doc:dc.title,v:dc.version,kind});refresh(a)}
