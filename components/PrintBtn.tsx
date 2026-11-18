"use client";
export default function PrintBtn({id,type}:{id?:string,type?:string}){
 return <button className="noprint" onClick={async()=>{if(id){const r=await fetch(`/api/print/${id}/${type}`,{method:"POST"});if(!r.ok){alert("Printing is not allowed: "+await r.text());return}}window.print()}}>Print / Save as PDF</button>}
