import "./globals.css"; import {company} from "@/lib/db"; import {palette,cssVars} from "@/lib/theme";
export const dynamic="force-dynamic";
export function generateMetadata(){return{title:company().name,icons:{icon:"/api/logo"}}}
export default function L({children}:{children:any}){const c=company();
 return <html lang="en" suppressHydrationWarning><head><style dangerouslySetInnerHTML={{__html:cssVars(palette(c.primary))}}/><script dangerouslySetInnerHTML={{__html:"try{if(localStorage.getItem('ew-theme')==='dark')document.documentElement.setAttribute('data-theme','dark')}catch(e){}"}}/></head><body>{children}</body></html>}
