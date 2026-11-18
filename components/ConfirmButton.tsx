"use client";
export default function ConfirmButton({msg,children,className="red"}:{msg:string;children:any;className?:string}){return <button className={className} onClick={e=>{if(!confirm(msg))e.preventDefault()}}>{children}</button>}
