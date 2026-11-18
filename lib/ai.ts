// Optional AI text assistant. Providers: Groq and/or Google Gemini (free tiers). Model names change often, so each provider
// tries a list of models in order (or the one set in GROQ_MODEL / GEMINI_MODEL). If one provider fails, the next one is tried.
// Sends ONLY business category, general location, purpose and products. Never names, TIN, phone, account numbers or amounts.
// The AI may not write digits: fields containing digits are dropped and the template text stays.
export const AI_FIELDS:[string,string,string][]=[
 ["background","2.1 Business Background","2 to 3 sentences describing the business and the customers it serves"],
 ["vision","2.3 Vision Statement","one sentence"],
 ["mission","2.4 Mission Statement","2 sentences"],
 ["objectives","2.6 Strategic Objectives","2 to 3 sentences covering short-term and long-term objectives"],
 ["success","2.7 Key Success Factors","2 sentences"],
 ["advantages","2.8 Business Competitive Advantages","2 sentences, only advantages that follow from the facts given"],
 ["industry","5.1 Industry Overview","2 to 3 general sentences without statistics"],
 ["customers","5.4 Customer Needs Assessment","2 sentences"]];
const clean=(t:any)=>typeof t==="string"&&t.length>=20&&t.length<=900&&!/\d/.test(t)&&!/[*#`]/.test(t)&&!/\{(?!BUSINESS\})/.test(t);
const trunc=(s:string,n=170)=>s.length>n?s.slice(0,n)+"…":s;
type R={ok:true,text:string}|{ok:false,status:number,msg:string};
async function post(url:string,headers:any,body:any){const ac=new AbortController(),to=setTimeout(()=>ac.abort(),40000);
  try{const r=await fetch(url,{method:"POST",signal:ac.signal,headers:{"Content-Type":"application/json",...headers},body:JSON.stringify(body)});let j:any={};try{j=await r.json()}catch{}return{status:r.status,j}}
  catch(e:any){return{status:0,j:{error:{message:e?.name==="AbortError"?"timed out":"no connection"}}}}finally{clearTimeout(to)}}
const emsg=(j:any)=>trunc(String(j?.error?.message||j?.message||""));
async function groq(key:string,model:string,sys:string,user:string,max:number):Promise<R>{const gpt=model.startsWith("openai/gpt-oss");
  for(const json of [true,false]){
    const {status,j}=await post("https://api.groq.com/openai/v1/chat/completions",{Authorization:"Bearer "+key},{model,temperature:0.4,max_tokens:max,...(gpt?{reasoning_effort:"low"}:{}),...(json?{response_format:{type:"json_object"}}:{}),messages:[{role:"system",content:sys},{role:"user",content:user}]});
    if(status===200){const t=j?.choices?.[0]?.message?.content;return t?{ok:true,text:String(t)}:{ok:false,status,msg:"empty answer"}}
    if(status===400&&json&&!/model/i.test(emsg(j)))continue;
    return{ok:false,status,msg:emsg(j)}}
  return{ok:false,status:400,msg:"request rejected"}}
async function gemini(key:string,model:string,sys:string,user:string,max:number):Promise<R>{
  const {status,j}=await post(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,{"x-goog-api-key":key},{systemInstruction:{parts:[{text:sys}]},contents:[{role:"user",parts:[{text:user}]}],generationConfig:{temperature:0.4,maxOutputTokens:max,responseMimeType:"application/json"}});
  if(status===200){const t=(j?.candidates?.[0]?.content?.parts||[]).filter((p:any)=>!p.thought).map((p:any)=>p.text||"").join("");return t?{ok:true,text:t}:{ok:false,status,msg:"empty answer"}}
  return{ok:false,status,msg:emsg(j)}}
const provs=()=>{const l:any[]=[],g=process.env.GROQ_API_KEY,m=process.env.GEMINI_API_KEY;
  if(g)l.push({name:"Groq",key:g,run:groq,models:process.env.GROQ_MODEL?[process.env.GROQ_MODEL]:["openai/gpt-oss-120b","openai/gpt-oss-20b"]});
  if(m)l.push({name:"Gemini",key:m,run:gemini,models:process.env.GEMINI_MODEL?[process.env.GEMINI_MODEL]:["gemini-3.5-flash-lite","gemini-3.8-flash"]});
  if(process.env.AI_PROVIDER==="gemini")l.reverse();return l};
const parse=(t:string)=>{const a=t.indexOf("{"),b=t.lastIndexOf("}");if(a<0||b<a)return null;try{const o=JSON.parse(t.slice(a,b+1)),d:Record<string,string>={};for(const [k] of AI_FIELDS)if(clean(o[k]))d[k]=o[k].trim();return d}catch{return null}};
const NOKEY="AI is not set up: add GROQ_API_KEY or GEMINI_API_KEY in Render > Environment, then redeploy.";
export async function aiText(facts:any):Promise<{ok:true,data:Record<string,string>,via:string}|{ok:false,error:string}>{
  const P=provs();if(!P.length)return{ok:false,error:NOKEY};
  const sys=`You write short, formal business plan sections for small Ethiopian businesses applying for Murabaha (Islamic) financing. Rules: use only the facts provided; never invent names, dates, numbers, statistics, licenses, awards or experience; do not use any digits at all; plain text, no markdown, no lists; call the business {BUSINESS}. Return ONLY one JSON object with these keys: ${AI_FIELDS.map(([k,,i])=>`"${k}" (${i})`).join(", ")}.`;
  const errs:string[]=[];
  for(const p of P)for(const model of p.models){const r:any=await p.run(p.key,model,sys,"Facts: "+JSON.stringify(facts),4000);
    if(r.ok){const d=parse(r.text);if(d)return{ok:true,data:d,via:p.name+" "+model};errs.push(`${p.name} ${model}: answer not readable`);continue}
    errs.push(`${p.name} ${model}: ${r.status||"no connection"} ${r.msg}`.trim());if([0,401,403,429].includes(r.status))break}
  return{ok:false,error:"The AI did not answer, so the template text was kept. Details: "+errs.join(" | ")}}
export async function aiPing(){const P=provs();if(!P.length)return[NOKEY];const out:string[]=[];
  for(const p of P)for(const model of p.models){const r:any=await p.run(p.key,model,"Reply with the single word OK.","Say OK",400);
    if(r.ok){out.push(`${p.name} ${model}: working`);break}out.push(`${p.name} ${model}: ${r.status||"no connection"} ${r.msg}`.trim());if([0,401,403,429].includes(r.status))break}
  return out}
