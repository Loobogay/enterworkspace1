const PEND=["Pending Consultant Approval","Pending Final Approval","Returned for Document Correction","Customer Revision"];
// A user sees only the jobs they created or worked on (the Consultant also sees jobs waiting for approval). The Administrator sees everything.
export const involved=(a:any,u:any)=>u.role==="Administrator"||u.role==="Audit"||a.by===u.name||(a.history||[]).some((h:any)=>h.u===u.name)||(u.role==="Consultant"&&PEND.includes(a.status));
