export async function register(){if(process.env.NEXT_RUNTIME==="nodejs"){const {init}=await import("./lib/db");await init()}}
