"use client";
import {useEffect,useState} from "react";
type N={id:string;text:string;href:string;at:string;unread:boolean};
const I=({d}:{d:string})=><svg className="ico" viewBox="0 0 24 24"><path d={d}/></svg>;
export default function TopActions({notes}:{notes:N[]}){const [dark,setDark]=useState(false),[open,setOpen]=useState(false),[list,setList]=useState(notes);
 useEffect(()=>setDark(document.documentElement.getAttribute("data-theme")==="dark"),[]);useEffect(()=>setList(notes),[notes]);
 const unread=list.filter(n=>n.unread).length;
 const toggle=()=>{const d=!dark;setDark(d);try{localStorage.setItem("ew-theme",d?"dark":"light")}catch{}if(d)document.documentElement.setAttribute("data-theme","dark");else document.documentElement.removeAttribute("data-theme")};
 const bell=()=>{const o=!open;setOpen(o);if(o&&unread){fetch("/api/notifications/read",{method:"POST"}).catch(()=>{});setTimeout(()=>setList(l=>l.map(n=>({...n,unread:false}))),2500)}};
 return <div className="topact"><button type="button" className="tb" onClick={toggle} title="Dark mode"><I d={dark?"M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4":"M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"}/>{dark?"Light":"Dark"}</button>
 <button type="button" className="tb" onClick={bell} title="Notifications"><I d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/>Alerts{unread>0&&<span className="cnt">{unread}</span>}</button>
 {open&&<div className="notes"><h4>Notifications</h4>{list.length?list.map(n=><a key={n.id} href={n.href} className={n.unread?"new":""}>{n.text}<small>{new Date(n.at).toLocaleString()}</small></a>):<p>No notifications yet.</p>}</div>}</div>}
