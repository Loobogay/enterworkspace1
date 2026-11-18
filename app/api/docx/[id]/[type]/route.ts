import {load,save,findRec,company} from "@/lib/db"; import {palette} from "@/lib/theme"; import {logPrint} from "@/lib/docflow"; import {me} from "@/lib/auth";
import {Document,Packer,AlignmentType,BorderStyle,HeightRule,VerticalAlign,PageBreak,Paragraph,HeadingLevel,Table,TableRow,TableCell,WidthType,TextRun} from "docx";
export const dynamic="force-dynamic";
export async function GET(_:Request,{params}:any){const u=me();if(!u||u.role!=="Secretary")return new Response("Only the Secretary can download approved documents.",{status:403});
 const d=load();const a=findRec(d,params.id);const dc=a?.docs?.[params.type];
 if(!dc)return new Response("Not found",{status:404});
 if(dc.status!=="Approved")return new Response("Document is not approved: final download is blocked.",{status:403});
 const ch:any[]=[];
 const today=new Date().toLocaleDateString("en-US",{month:"long",day:"2-digit",year:"numeric",timeZone:"Africa/Addis_Ababa"});
 for(const s of dc.sections){
  if(s.cover){const cp=(t:string,size:number,bold:boolean,font:string,after:number)=>new Paragraph({alignment:AlignmentType.CENTER,spacing:{after},children:[new TextRun({text:t,bold,size,font})]});
   const pal=palette(company().primary),bd=(c:string)=>({style:BorderStyle.SINGLE,size:24,color:c});
   ch.push(new Table({width:{size:100,type:WidthType.PERCENTAGE},rows:[new TableRow({height:{value:7600,rule:HeightRule.ATLEAST},children:[new TableCell({verticalAlign:VerticalAlign.CENTER,borders:{top:bd(pal.bd.slice(1)),left:bd(pal.bd.slice(1)),bottom:bd(pal.bl.slice(1)),right:bd(pal.bl.slice(1))},children:[cp(s.cover.name,52,true,"Arial",360),cp(s.cover.title,64,false,"Georgia",480),...(s.cover.to?[new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:480},children:[new TextRun({text:"To: ",bold:true,size:30,font:"Georgia"}),new TextRun({text:s.cover.to,size:30,font:"Georgia"})]})]:[]),cp(today,28,false,"Georgia",0)]})]})]}),new Paragraph({children:[new PageBreak()]}));continue}if(s.h)ch.push(new Paragraph({heading:HeadingLevel.HEADING_2,children:[new TextRun(s.h)]}));
  if(s.p)for(const l of String(s.p).split("\n"))ch.push(new Paragraph({alignment:AlignmentType.JUSTIFIED,children:l.split(/(\*\*[^*]+\*\*)/).filter(Boolean).map((x:string)=>x.startsWith("**")?new TextRun({text:x.slice(2,-2),bold:true}):new TextRun(x))}));
  if(s.rows)ch.push(new Table({width:{size:100,type:WidthType.PERCENTAGE},rows:s.rows.map((r:string[],i:number)=>new TableRow({children:r.map(x=>new TableCell({children:[new Paragraph({children:[new TextRun({text:String(x).replace(/^\*\*/,""),bold:i===0||String(r[0]).startsWith("**")})]})]}))}))}))}
 const buf=await Packer.toBuffer(new Document({sections:[{children:ch}]}));
 logPrint(a,params.type,u,"docx");d.log.unshift({t:new Date().toISOString(),u:u.name,a:"Downloaded "+dc.title+" v"+dc.version,ref:a.code});save(d);
 return new Response(buf,{headers:{"Content-Type":"application/vnd.openxmlformats-officedocument.wordprocessingml.document","Content-Disposition":`attachment; filename="${a.code}-${params.type}.docx"`}})}
