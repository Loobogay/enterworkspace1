const M:[RegExp,string][]=[[/^(Approved|Ready for Printing)$/,"s-ok"],[/^Printed$/,"s-bl"],[/^(Draft|Archived|Not printed)$/,"s-gr"],[/Pending|Needs printing/,"s-wa"],[/Returned|Revision/,"s-or"],[/Rejected/,"s-er"]];
export default function Badge({s}:{s:string}){const c=M.find(([r])=>r.test(s))?.[1]||"";return <span className={"badge "+c}>{s}</span>}
