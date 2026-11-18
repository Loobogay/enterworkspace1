import fs from "fs"; import path from "path"; import crypto from "crypto";
const URL_=process.env.DATABASE_URL;const G:any=globalThis as any;
const F=process.env.DATA_FILE||path.join(process.cwd(),"data","db.json");
const K=crypto.createHash("sha256").update(process.env.APP_SECRET||"change-me-secret").digest();
export const uid=()=>crypto.randomUUID();
export const hash=(p:string)=>{const s=crypto.randomBytes(8).toString("hex");return s+":"+crypto.scryptSync(p,s,32).toString("hex")};
export const verify=(p:string,h:string)=>{const[s,x]=h.split(":");return crypto.scryptSync(p,s,32).toString("hex")===x};
export const enc=(t:string)=>{const iv=crypto.randomBytes(12);const c=crypto.createCipheriv("aes-256-gcm",K,iv);const b=Buffer.concat([c.update(t,"utf8"),c.final()]);return [iv,c.getAuthTag(),b].map(x=>x.toString("hex")).join(".")};
export const dec=(t:string)=>{try{const[i,g,b]=t.split(".").map(x=>Buffer.from(x,"hex"));const d=crypto.createDecipheriv("aes-256-gcm",K,i);d.setAuthTag(g);return Buffer.concat([d.update(b),d.final()]).toString("utf8")}catch{return ""}};
function seedData(){const pw=process.env.SEED_PASSWORD||"Enter@2026";
  const u=(username:string,name:string,role:string)=>({id:uid(),username,name,role,active:true,hash:hash(pw)});
  return {users:[u("admin","System Administrator","Administrator"),u("secretary","Secretary","Secretary"),u("consultant","Financial Consultant","Consultant")],
   banks:["Shabelle Bank","Awash Bank","Dashen Bank","Zamzam Bank","Hijra Bank"],customers:[],apps:[],log:[]}}
let pool:any;
const getPool=async()=>{if(!pool){const {Pool}=await import("pg");pool=new Pool({connectionString:URL_,ssl:/localhost|127\.0\.0\.1/.test(URL_||"")?false:{rejectUnauthorized:false},max:3})}return pool};
function persist(){G.__q=(G.__q||Promise.resolve()).then(async()=>{const p=await getPool();await p.query("insert into ew_store(id,data) values(1,$1) on conflict(id) do update set data=excluded.data",[JSON.stringify(G.__ew)])}).catch((e:any)=>console.error("persist failed",e))}
export async function init(){
  if(!URL_||G.__ew)return;
  const p=await getPool();await p.query("create table if not exists ew_store(id int primary key,data jsonb not null)");await p.query("create table if not exists ew_files(id text primary key,data bytea not null)");
  const r=await p.query("select data from ew_store where id=1");
  if(r.rows[0])G.__ew=r.rows[0].data;else{G.__ew=seedData();persist()}}
function loadRaw():any{
  if(URL_){if(!G.__ew)throw new Error("Database not ready");return structuredClone(G.__ew)}
  if(!fs.existsSync(F)){fs.mkdirSync(path.dirname(F),{recursive:true});fs.writeFileSync(F,JSON.stringify(seedData()))}
  return JSON.parse(fs.readFileSync(F,"utf8"));}
export function save(d:any){if(URL_){G.__ew=d;persist()}else fs.writeFileSync(F,JSON.stringify(d,null,1))}
export const DEFAULT_COMPANY={name:"Enter Workspace",tagline:"IT & Financial Consultancy",slogan:"Empowering Business Through Technology and Finance",primary:"#225DA3",address:"",phone:"",email:"",logo:null as any};
export function load():any{const d=loadRaw();d.fss=d.fss||[];d.notes=d.notes||[];d.ftx=d.ftx||[];const s=d.settings=d.settings||{};s.company={...DEFAULT_COMPANY,...(s.company||{})};
  s.lists={banks:d.banks||["Shabelle Bank","Awash Bank","Dashen Bank","Zamzam Bank","Hijra Bank"],categories:["Retail","Wholesale","Transport","Hotel","Livestock","Manufacturing","Service","Other"],methods:["Cash","Bank transfer","Mobile money","Cheque"],expenseCats:["Salaries","Rent","Utilities","Transport","Internet & communication","Office supplies","Taxes & licences","Marketing","Other expense"],docTypes:["Trade license","TIN certificate","ID card","Bank statement","Business photo","Other"],ownership:["Sole proprietorship","Partnership","Private limited company","Cooperative","Other"],...(s.lists||{})};
  const L=s.lists=s.lists||{};L.banks=L.banks||d.banks||["Shabelle Bank","Awash Bank","Dashen Bank","Zamzam Bank","Hijra Bank"];L.categories=L.categories||["Retail","Wholesale","Transport","Hotel","Livestock","Manufacturing","Service","Other"];L.methods=L.methods||["Cash","Bank transfer","Mobile money","Cheque"];L.expenseCats=L.expenseCats||["Salaries","Rent","Utilities","Transport","Internet & communication","Office supplies","Taxes & licences","Marketing","Other expense"];L.docTypes=L.docTypes||["Trade license","TIN certificate","ID card","Bank statement","Business photo","Other"];
  s.services=s.services||[{id:"svc-1",name:"Request Letter + Business Plan",desc:"Preparation of the Murabaha request letter and business plan",price:0},{id:"svc-2",name:"Financial Statements",desc:"Preparation of two-year financial statements",price:0},{id:"svc-3",name:"Other document service",desc:"",price:0}];return d}
// Safe for build time and the login page: never seeds a database and never throws
export function company(){try{if(URL_?!G.__ew:!fs.existsSync(F))return DEFAULT_COMPANY;return load().settings.company}catch{return DEFAULT_COMPANY}}
export const findRec=(d:any,id:string)=>d.apps.find((x:any)=>x.id===id)||(d.fss||[]).find((x:any)=>x.id===id);
const FD=path.join(path.dirname(F),"files");
export async function putFile(id:string,buf:Buffer){if(URL_){const p=await getPool();await p.query("insert into ew_files(id,data) values($1,$2)",[id,buf])}else{fs.mkdirSync(FD,{recursive:true});fs.writeFileSync(path.join(FD,id),buf)}}
export async function getFile(id:string):Promise<Buffer|null>{if(URL_){const p=await getPool();const r=await p.query("select data from ew_files where id=$1",[id]);return r.rows[0]?.data||null}const q=path.join(FD,path.basename(id));return fs.existsSync(q)?fs.readFileSync(q):null}
export async function delFile(id:string){if(URL_){const p=await getPool();await p.query("delete from ew_files where id=$1",[id])}else{const q=path.join(FD,path.basename(id));if(fs.existsSync(q))fs.unlinkSync(q)}}
