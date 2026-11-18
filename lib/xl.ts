import ExcelJS from "exceljs"; import {INC,BS} from "./fsfields";
const nz=(s:any)=>String(s??"").toLowerCase().replace(/[^a-z%]/g,"");
const MAP:Record<string,string>={};[...INC,...BS].forEach(([k,l])=>MAP[nz(l)]=k);
Object.assign(MAP,{accountspayable:"pay",cashandcashequivalent:"cash",cashandcashequivalents:"cash",retainedearnings:"ret",salaryandbenefits:"sal",generaladminexpense:"ga",generalandadministrativeexpense:"ga",depreciation:"dep",revenue:"rev",sales:"rev",costofsales:"cogs"});
const raw=(c:any)=>{let v=c?.value;if(v&&typeof v==="object"&&!(v instanceof Date)){if("result" in v)v=v.result;else if("richText" in v)v=v.richText.map((x:any)=>x.text).join("");else if("text" in v)v=v.text}return v};
const num=(v:any)=>{if(typeof v==="number")return v;let s=String(v??"").trim();if(!s)return 0;let neg=false;if(/^\(.*\)$/.test(s)){neg=true;s=s.slice(1,-1)}const n=Number(s.replace(/[,\s]/g,""));return isNaN(n)?0:neg?-n:n};
const dt=(v:any)=>{if(v instanceof Date)return v.toISOString().slice(0,10);const t=Date.parse(String(v||""));return isNaN(t)?"":new Date(t).toISOString().slice(0,10)};
export async function parseFs(buf:Buffer){const wb=new ExcelJS.Workbook();await wb.xlsx.load(buf as any);const ws=wb.worksheets[0];const cur:any={},prev:any={};let matched=0,end="",taxRate:number|undefined;
  ws?.eachRow({includeEmpty:false},row=>{const l=nz(raw(row.getCell(1)));const k=MAP[l];
    if(k){cur[k]=num(raw(row.getCell(2)));prev[k]=num(raw(row.getCell(3)));matched++}
    else if(l==="currentyearenddate")end=dt(raw(row.getCell(2)));
    else if(l==="profittax%"||l==="profittax")taxRate=num(raw(row.getCell(2)))});
  return{matched,end,taxRate,cur,prev}}
export async function templateFs(){const wb=new ExcelJS.Workbook();const ws=wb.addWorksheet("Financial Statements");
  ws.addRow(["Financial statements input template — fill the Current year and Previous year columns (ETB). Do not change the labels in column A."]);ws.addRow([]);
  ws.addRow(["Current year-end date",""]);ws.addRow(["Profit tax %",30]);ws.addRow([]);
  ws.addRow(["Item","Current year","Previous year"]).font={bold:true};
  ws.addRow(["INCOME STATEMENT"]).font={bold:true};INC.forEach(([,l])=>ws.addRow([l,0,0]));
  ws.addRow(["BALANCE SHEET"]).font={bold:true};BS.forEach(([,l])=>ws.addRow([l,0,0]));
  ws.getColumn(1).width=42;ws.getColumn(2).width=20;ws.getColumn(3).width=20;ws.getColumn(2).numFmt="#,##0.00";ws.getColumn(3).numFmt="#,##0.00";
  ws.getCell("B3").numFmt="yyyy-mm-dd";return Buffer.from(await wb.xlsx.writeBuffer())}
