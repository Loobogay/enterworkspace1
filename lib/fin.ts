export const INC=["Consultancy fee","Documentation fee","Advance payment","Other income"];
export const EXP=["Salaries","Rent","Utilities","Transport","Internet & communication","Office supplies","Taxes & licences","Marketing","Other expense"];
export const live=(d:any)=>(d.ftx||[]).filter((x:any)=>!x.void);
export const sum=(a:any[],t:string)=>a.filter(x=>x.type===t).reduce((s,x)=>s+x.amount,0);
