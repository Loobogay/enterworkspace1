import {login} from "../actions"; import {company} from "@/lib/db";
export const dynamic="force-dynamic";
export default function P({searchParams}:any){const c=company();return <div className="login"><div className="lp"><div className="plate"><img src="/api/logo" alt=""/></div><h1>{c.name}</h1><p>{c.tagline}</p>{c.slogan&&<p style={{marginTop:14,fontSize:14}}>{c.slogan}</p>}</div>
<div className="lf"><form action={login}><h2>Welcome back</h2><p style={{color:"#5B6B80",marginTop:0}}>Sign in to continue</p>{searchParams.e&&<div className="err">Invalid username or password</div>}
<label>Username<input name="u" autoComplete="username" required/></label><br/><label>Password<input name="p" type="password" autoComplete="current-password" required/></label><br/><button style={{width:"100%"}}>Sign in</button></form></div></div>}
