export const f=(n:any)=>Number(n||0).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
// Flat-markup method (configurable per bank later): markup = amount x rate; sale price = amount + markup; installment = sale price / n
export const METHOD="Flat markup: Markup = Financing x Rate; Installment = Total Sale Price / Number of installments";
export function terms(a:any){const amt=+a.amount||0,eq=+a.equity||0,mk=amt*(+a.markup||0)/100,total=amt+mk;
  const n=a.freq==="Quarterly"?Math.ceil((+a.months||0)/3):(+a.months||0),inst=n?total/n:0;
  const rows:string[][]=[];let bal=total;for(let i=1;i<=n;i++){bal=Math.max(0,bal-inst);rows.push([String(i),f(inst),f(bal)])}
  const tpc=amt+eq;return{amt,eq,mk,total,n,inst,rows,tpc,eqp:tpc?eq/tpc*100:0,finp:tpc?amt/tpc*100:0}}
const KEYS=["rev","cogs","sal","ga","dep","cash","inv","rec","prep","equip","onc","pay","capital","ret"];
function yr(x:any,rate:number){const g=(k:string)=>+(x||{})[k]||0;const o:any={};KEYS.forEach(k=>o[k]=g(k));
  o.gp=o.rev-o.cogs;o.exp=o.sal+o.ga+o.dep;o.nbt=o.gp-o.exp;o.tax=o.nbt>0?o.nbt*rate/100:0;o.nat=o.nbt-o.tax;
  o.ca=o.cash+o.inv+o.rec+o.prep;o.nca=o.equip+o.onc;o.ta=o.ca+o.nca;o.tl=o.pay;o.te=o.capital+o.ret;o.diff=o.ta-(o.tl+o.te);o.balanced=Math.abs(o.diff)<0.01;return o}
// Two-year statements. Nothing is estimated: cash flow is DERIVED from the two balance sheets and the income statement.
export function fin(a:any){const x=a.fin;if(!x)return null;const rate=x.taxRate===undefined?30:+x.taxRate;
  const c=yr(x.cur||x,rate),p=yr(x.prev,rate);
  const dRec=c.rec-p.rec,dInv=c.inv-p.inv,dPre=c.prep-p.prep,dPay=c.pay-p.pay;
  const op=c.nat+c.dep-dRec-dInv-dPre+dPay,capex=c.nca-p.nca+c.dep,inv=-capex,dCap=c.capital-p.capital,wd=c.nat-(c.ret-p.ret),fn=dCap-wd,net=op+inv+fn,dCash=c.cash-p.cash;
  const w:string[]=[];
  if(!c.balanced)w.push(`Current-year balance sheet is out by ETB ${f(c.diff)} (assets vs liabilities + equity).`);
  if(!p.balanced)w.push(`Previous-year balance sheet is out by ETB ${f(p.diff)}.`);
  if(Math.abs(net-dCash)>=0.01)w.push(`Cash flow does not reconcile to the change in cash (difference ETB ${f(net-dCash)}). Check both balance sheets.`);
  if(capex<-0.01)w.push("Non-current assets fell by more than depreciation: check for disposals.");
  if(wd<-0.01)w.push("Retained earnings rose by more than net profit: check the figures.");
  if(!p.rev&&!p.ta)w.push("Previous-year figures are empty.");
  return{end:x.end,taxRate:rate,source:x.source||"Customer provided",note:x.note,y:[c,p],cf:{dRec,dInv,dPre,dPay,op,inv,dCap,wd,fn,net,dCash},warnings:w}}
