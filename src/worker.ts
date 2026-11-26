export interface Env {
  DB: D1Database;
  GEMINI_API_KEY?: string;
  ASSETS: Fetcher;
}
const json=(data:unknown,status=200,headers:Record<string,string>={})=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store",...headers}});
const now=()=>new Date().toISOString();
const id=()=>crypto.randomUUID();
const enc=new TextEncoder();
const hex=(b:ArrayBuffer)=>Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,"0")).join("");
async function digest(value:string){return hex(await crypto.subtle.digest("SHA-256",enc.encode(value)));}
async function passwordHash(password:string,salt:string){const key=await crypto.subtle.importKey("raw",enc.encode(password),"PBKDF2",false,["deriveBits"]);return hex(await crypto.subtle.deriveBits({name:"PBKDF2",salt:enc.encode(salt),iterations:120000,hash:"SHA-256"},key,256));}
function cookie(request:Request,name:string){return (request.headers.get("cookie")||"").split(";").map(v=>v.trim()).find(v=>v.startsWith(name+"="))?.slice(name.length+1)||"";}
async function currentUser(request:Request,env:Env){
 const token=cookie(request,"wl_session");if(!token)return null;
 const row=await env.DB.prepare("SELECT u.id,u.email,u.display_name FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>?").bind(await digest(token),now()).first<{id:string,email:string,display_name:string}>();
 return row||null;
}
const sessionCookie=(token:string,maxAge:number)=>`wl_session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`;
async function gemini(env:Env,prompt:string){
 if(!env.GEMINI_API_KEY)throw new Error("GEMINI_API_KEY secret is not configured");
 const response=await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key="+encodeURIComponent(env.GEMINI_API_KEY),{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:prompt}]}]})});
 const data:any=await response.json();if(!response.ok)throw new Error(data?.error?.message||"Gemini request failed");
 return data?.candidates?.[0]?.content?.parts?.map((p:any)=>p.text||"").join("")||"";
}
const NEWS:Record<string,string>={all:"",economy:"BUSINESS",life:"NATION",entertainment:"ENTERTAINMENT",sports:"SPORTS",it:"TECHNOLOGY"};
function xmlText(s:string){return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,"$1").replace(/<[^>]+>/g,"").replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,"<").replace(/&gt;/g,">").trim();}
async function googleNews(section:string){
 const topic=NEWS[section]??"";
 const url=topic?`https://news.google.com/rss/headlines/section/topic/${topic}?hl=ko&gl=KR&ceid=KR:ko`:"https://news.google.com/rss?hl=ko&gl=KR&ceid=KR:ko";
 const res=await fetch(url,{headers:{"user-agent":"WanderlustAI/1.0 RSS reader","accept":"application/rss+xml, application/xml, text/xml"}});
 if(!res.ok)throw new Error("Google News RSS HTTP "+res.status);
 const xml=await res.text();const items=[...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0,20).map(m=>{
  const block=m[1];const get=(tag:string)=>xmlText(block.match(new RegExp("<"+tag+">([\\s\\S]*?)</"+tag+">","i"))?.[1]||"");
  const title=get("title"),link=get("link"),pubDate=get("pubDate"),source=get("source");
  return {title,link,pubDate,source};
 }).filter(x=>x.title&&x.link);
 return items;
}
async function api(request:Request,env:Env,url:URL):Promise<Response>{
 const path=url.pathname,method=request.method;
 if(path==="/api/health"&&method==="GET")return json({status:"ok",service:"Wanderlust AI Cloudflare",storage:"D1"});
 if(path==="/api/auth/register"&&method==="POST"){
  const b:any=await request.json();const email=String(b.email||"").trim().toLowerCase(),password=String(b.password||""),displayName=String(b.displayName||"").trim();
  if(!email||!/^\S+@\S+\.\S+$/.test(email)||password.length<8)return json({error:"올바른 이메일과 8자 이상의 비밀번호를 입력해 주세요."},400);
  const salt=crypto.randomUUID(),hash=await passwordHash(password,salt),userId=id(),time=now();
  try{await env.DB.prepare("INSERT INTO users(id,email,password_hash,password_salt,display_name,created_at,updated_at) VALUES(?,?,?,?,?,?,?)").bind(userId,email,hash,salt,displayName,time,time).run();}
  catch{return json({error:"이미 가입된 이메일이거나 회원 등록에 실패했습니다."},409);}
  const token=id()+id(),expires=new Date(Date.now()+30*86400000).toISOString();
  await env.DB.prepare("INSERT INTO sessions(token_hash,user_id,expires_at,created_at) VALUES(?,?,?,?)").bind(await digest(token),userId,expires,time).run();
  return json({user:{id:userId,email,displayName} ,ok:true},200,{"set-cookie":sessionCookie(token,30*86400)});
 }
 if(path==="/api/auth/login"&&method==="POST"){
  const b:any=await request.json(),email=String(b.email||"").trim().toLowerCase(),password=String(b.password||"");
  const user=await env.DB.prepare("SELECT id,email,password_hash,password_salt,display_name FROM users WHERE lower(email)=?").bind(email).first<any>();
  if(!user||await passwordHash(password,user.password_salt)!==user.password_hash)return json({error:"이메일 또는 비밀번호가 올바르지 않습니다."},401);
  const token=id()+id(),time=now(),expires=new Date(Date.now()+30*86400000).toISOString();
  await env.DB.prepare("INSERT INTO sessions(token_hash,user_id,expires_at,created_at) VALUES(?,?,?,?)").bind(await digest(token),user.id,expires,time).run();
  return json({user:{id:user.id,email:user.email,displayName:user.display_name},ok:true},200,{"set-cookie":sessionCookie(token,30*86400)});
 }
 if(path==="/api/auth/logout"&&method==="POST"){
  const token=cookie(request,"wl_session");if(token)await env.DB.prepare("DELETE FROM sessions WHERE token_hash=?").bind(await digest(token)).run();
  return json({ok:true},200,{"set-cookie":"wl_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0"});
 }
 if(path==="/api/auth/me"&&method==="GET")return json({user:await currentUser(request,env)});
 if(path==="/api/google-news"&&method==="GET"){
  try{return json({success:true,articles:await googleNews(url.searchParams.get("section")||"all"),source:"Google News RSS",fetchedAt:now()});}
  catch(e){return json({success:false,articles:[],error:e instanceof Error?e.message:"뉴스 수집 실패",source:"Google News RSS",fetchedAt:now()},502);}
 }
 if(path==="/api/generate-topics"&&method==="POST"){
  const b:any=await request.json(),category=String(b.category||b.categoryType||"travel");
  try{const text=await gemini(env,`한국어 콘텐츠 전략가로서 ${category} 분야의 최신성 있는 블로그 주제 5개를 추천하세요. 각 항목을 title, description, keywords 배열, style 필드로 갖는 JSON 배열만 출력하세요. 사실로 확인되지 않은 최신 사건은 단정하지 마세요.`);const clean=text.replace(/^```json\s*/,"").replace(/\s*```$/,"");return json({success:true,topics:JSON.parse(clean)});}
  catch(e){return json({error:e instanceof Error?e.message:"주제 추천 실패"},502);}
 }
 const user=await currentUser(request,env);
 if(path.startsWith("/api/")&&!user&&["POST","PUT","PATCH","DELETE"].includes(method))return json({error:"로그인이 필요합니다."},401);
 if(path==="/api/posts"&&method==="GET"){
  const rows=await env.DB.prepare("SELECT id,data_json,created_at,updated_at FROM posts WHERE user_id=? ORDER BY updated_at DESC").bind(user!.id).all<any>();
  return json({posts:rows.results.map((r:any)=>({...JSON.parse(r.data_json),id:r.id,createdAt:r.created_at,updatedAt:r.updated_at}))});
 }
 if(path==="/api/posts"&&method==="POST"){
  const b:any=await request.json(),post=b.post||b,idValue=String(post.id||id()),time=now();
  await env.DB.prepare("INSERT INTO posts(id,user_id,status,is_public,data_json,created_at,updated_at) VALUES(?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET status=excluded.status,is_public=excluded.is_public,data_json=excluded.data_json,updated_at=excluded.updated_at WHERE posts.user_id=excluded.user_id").bind(idValue,user!.id,post.status||"draft",post.isPublic?1:0,JSON.stringify({...post,id:idValue}),post.createdAt||time,time).run();
  return json({ok:true,id:idValue});
 }
 if(path==="/api/posts/published"&&method==="GET"){
  const rows=await env.DB.prepare("SELECT id,data_json,created_at,updated_at FROM posts WHERE is_public=1 ORDER BY updated_at DESC LIMIT 100").all<any>();
  return json({posts:rows.results.map((r:any)=>({...JSON.parse(r.data_json),id:r.id,createdAt:r.created_at,updatedAt:r.updated_at}))});
 }
 if(path==="/api/scheduled"&&method==="GET"){
  const rows=await env.DB.prepare("SELECT id,data_json,scheduled_at,status,created_at FROM scheduled_tasks WHERE user_id=? ORDER BY scheduled_at").bind(user!.id).all<any>();
  return json({tasks:rows.results.map((r:any)=>({...JSON.parse(r.data_json),id:r.id,scheduledAt:r.scheduled_at,status:r.status,createdAt:r.created_at}))});
 }
 if(path==="/api/scheduled"&&method==="POST"){
  const b:any=await request.json(),task=b.task||b,time=now();
  await env.DB.prepare("INSERT INTO scheduled_tasks(id,user_id,scheduled_at,recurrence,status,data_json,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET scheduled_at=excluded.scheduled_at,recurrence=excluded.recurrence,status=excluded.status,data_json=excluded.data_json,updated_at=excluded.updated_at WHERE scheduled_tasks.user_id=excluded.user_id").bind(task.id,user!.id,task.scheduledAt,task.recurrence||"none",task.status||"pending",JSON.stringify(task),task.createdAt||time,time).run();
  return json({ok:true});
 }
 if(path==="/api/scheduled/due"&&method==="POST"){
  const time=now(),rows=await env.DB.prepare("SELECT id,data_json FROM scheduled_tasks WHERE user_id=? AND status='pending' AND scheduled_at<=? ORDER BY scheduled_at").bind(user!.id,time).all<any>();
  const claimed=[];
  for(const row of rows.results as any[]){const claim=await env.DB.prepare("UPDATE scheduled_tasks SET status='processing',updated_at=? WHERE id=? AND user_id=? AND status='pending' AND scheduled_at<=?").bind(time,row.id,user!.id,time).run();if(claim.meta.changes)claimed.push(JSON.parse(row.data_json));}
  return json({tasks:claimed,checkedAt:time});
 }
 if(path==="/api/scheduled"&&method==="DELETE"){
  const idValue=url.searchParams.get("id");if(!idValue)return json({error:"id is required"},400);
  await env.DB.prepare("DELETE FROM scheduled_tasks WHERE id=? AND user_id=?").bind(idValue,user!.id).run();return json({ok:true});
 }
 return json({error:"Not found",path},404);
}
export default {async fetch(request:Request,env:Env):Promise<Response>{
 const url=new URL(request.url);
 if(url.pathname.startsWith("/api/")){try{return await api(request,env,url);}catch(e){console.error("Wanderlust API error",e);return json({error:e instanceof Error?e.message:"Internal server error"},500);}}
 if(url.pathname!=="/"&&url.pathname.endsWith("/"))return Response.redirect(new URL(url.pathname.replace(/\/+$/,"")+url.search,url),308);
 return env.ASSETS.fetch(request);
}};
