const rgb=(c:string)=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16));
const hx=(a:number[])=>"#"+a.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,"0")).join("").toUpperCase();
const mix=(c:string,t:string,k:number)=>{const a=rgb(c),b=rgb(t);return hx(a.map((v,i)=>v+(b[i]-v)*k))};
export function palette(primary:string){const p=/^#[0-9a-f]{6}$/i.test(primary||"")?primary.toUpperCase():"#225DA3";
  if(p==="#225DA3")return{b:p,bd:"#164176",bn:"#0D264C",bl:"#6FB1E8",bg:"#EEF3F9",ln:"#DCE5F0"};
  return{b:p,bd:mix(p,"#000000",.33),bn:mix(p,"#000000",.62),bl:mix(p,"#FFFFFF",.45),bg:mix(p,"#FFFFFF",.93),ln:mix(p,"#FFFFFF",.82)}}
export const cssVars=(p:any)=>`html:root{--b:${p.b};--bd:${p.bd};--bn:${p.bn};--bl:${p.bl}}html:root:not([data-theme="dark"]){--bg:${p.bg};--ln:${p.ln}}`;
