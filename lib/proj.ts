import {f,terms,fin} from "./calc";
const num=(x:any)=>Number(String(x||"").replace(/,/g,""))||0;
export function uof(a:any){const rows=String(a.plan?.useOfFunds||"").split("\n").map(l=>l.split("|").map(x=>x.trim())).filter(r=>r[0]).map(r=>({d:r[0],q:num(r[1]),p:num(r[2]),t:num(r[1])*num(r[2])}));return{rows,total:rows.reduce((s,r)=>s+r.t,0)}}
// Projections come only from the inputs entered (monthly sales, cost %, expenses). Nothing is invented.
export function proj(a:any){const p=a.plan||{},t=terms(a),ms=+p.mSales||0;if(!ms)return null;
  const cogs=+p.mCogs||0,gp=ms-cogs,ox=+p.mOpex||0,np=gp-ox,mInst=t.total/((+a.months)||1),cov=mInst?np/mInst:0;
  return{ms,cogs,gp,ox,np,aSales:ms*12,aNp:np*12,mInst,cov,surplus:np-mInst,minSales:gp>0?(mInst+ox)/(gp/ms):0,level:cov>=1.25?"adequate":cov>=1?"marginal":"insufficient"}}
export function planChecks(a:any){const w:string[]=[],t=terms(a),u=uof(a),pr=proj(a),fi=fin(a);
  if(u.rows.length&&u.total>0&&Math.abs(u.total-t.amt)>0.5)w.push(`Use-of-funds items total ETB ${f(u.total)} but the requested financing is ETB ${f(t.amt)}.`);
  if(!pr)w.push("Projections are not entered (monthly sales, cost of goods sold, expenses).");
  else if(pr.cogs>pr.ms)w.push("Monthly cost of goods sold is higher than monthly sales. Enter amounts in ETB, not percentages.");
  else{if(pr.cov<1)w.push(`Projected monthly net profit (ETB ${f(pr.np)}) does not cover the monthly installment (ETB ${f(pr.mInst)}). Review the amount, period or equity.`);else if(pr.cov<1.25)w.push(`Repayment coverage is only ${pr.cov.toFixed(2)}x; headroom is limited.`);
    }
  return w}
