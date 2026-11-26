export interface Env {
  DB: D1Database;
  GEMINI_API_KEY?: string;
  GEMINI_MODEL?: string;
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
 const response=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(env.GEMINI_MODEL||"gemini-3.8-flash")}:generateContent?key=${encodeURIComponent(env.GEMINI_API_KEY)}`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:prompt}]}]})});
 const data:any=await response.json();if(!response.ok)throw new Error(data?.error?.message||"Gemini request failed");
 return data?.candidates?.[0]?.content?.parts?.map((p:any)=>p.text||"").join("")||"";
}
function parseAIJson(raw:string):any{
 const clean=raw.replace(/```(?:json)?/gi,"").trim();
 const objectAt=clean.indexOf("{"),arrayAt=clean.indexOf("[");
 const start=objectAt<0?arrayAt:arrayAt<0?objectAt:Math.min(objectAt,arrayAt);
 if(start<0)throw new Error("AI 응답에서 JSON을 찾을 수 없습니다.");
 return JSON.parse(clean.slice(start));
}
const NEWS:Record<string,string>={"": "",BUSINESS:"BUSINESS",LIFESTYLE:"LIFESTYLE",ENTERTAINMENT:"ENTERTAINMENT",SPORTS:"SPORTS",TECHNOLOGY:"TECHNOLOGY"};
function xmlText(s:string){return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,"$1").replace(/<[^>]+>/g,"").replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,"<").replace(/&gt;/g,">").trim();}
async function googleNews(section:string){
 const topic=NEWS[section]??section;
 const url=topic?`https://news.google.com/rss/headlines/section/topic/${topic}?hl=ko&gl=KR&ceid=KR:ko`:"https://news.google.com/rss?hl=ko&gl=KR&ceid=KR:ko";
 const res=await fetch(url,{headers:{"user-agent":"WanderlustAI/1.0 RSS reader","accept":"application/rss+xml, application/xml, text/xml"}});
 if(!res.ok)throw new Error("Google News RSS HTTP "+res.status);
 const xml=await res.text();const items=[...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0,10).map(m=>{
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
  try{const text=await gemini(env,`한국어 콘텐츠 전략가로서 ${category} 분야의 최신성 있는 블로그 주제 5개를 추천하세요. 각 항목을 id,title,description,keywords 배열,travelStyle,duration,icon,reason 필드로 갖는 JSON 배열만 출력하세요. 사실로 확인되지 않은 최신 사건은 단정하지 마세요.`);return json({success:true,topics:parseAIJson(text)});}
  catch(e){return json({error:e instanceof Error?e.message:"주제 추천 실패"},502);}
 }
 const user=await currentUser(request,env);
 if(path.startsWith("/api/")&&!user&&["POST","PUT","PATCH","DELETE"].includes(method))return json({error:"로그인이 필요합니다."},401);
 if(path==="/api/posts"&&method==="GET"){
  const rows=await env.DB.prepare("SELECT id,data_json,created_at,updated_at FROM posts WHERE user_id=? ORDER BY updated_at DESC").bind(user!.id).all<any>();
  return json({posts:rows.results.map((r:any)=>({...JSON.parse(r.data_json),id:r.id,createdAt:r.created_at,updatedAt:r.updated_at}))});
 }
 if(path==="/api/posts"&&method==="DELETE"){
  const postId=url.searchParams.get("id");if(!postId)return json({error:"id is required"},400);
  await env.DB.prepare("DELETE FROM posts WHERE id=? AND user_id=?").bind(postId,user!.id).run();return json({ok:true});
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

 if(path==="/api/generate-blog"&&method==="POST"){
  const b:any=await request.json();if(!b.destination)return json({error:"주제를 입력해 주세요."},400);
  try{const raw=await gemini(env,"한국어 전문 블로그 에디터로서 "+b.destination+" 주제로 1500자 이상의 실용적인 블로그를 작성하세요. 유형 "+(b.categoryType||"travel")+". 기간 "+(b.duration||"")+". 스타일 "+(b.travelStyle||"")+". 키워드 "+(b.keywords||[]).join(",")+". 반드시 JSON 객체만 반환하고 title,subtitle,destination,duration,concept,tone,targetAudience,budget,season,metaKeywords(배열),hashtags(배열),itinerary(배열),markdownContent,travelTips(배열),seoDescription 필드를 포함하세요.");const data=parseAIJson(raw);return json({success:true,data});}
  catch(e){return json({success:false,error:e instanceof Error?e.message:"블로그 생성 실패"},502);}
 }
 if(path==="/api/generate-sns"&&method==="POST"){
  const b:any=await request.json();if(!b.topic)return json({error:"SNS 주제를 입력해 주세요."},400);
  try{const raw=await gemini(env,"한국어 SNS 전문 에디터. 주제 "+b.topic+". 대상 "+(b.targetAudience||"")+". 톤 "+(b.tone||"")+". 키워드 "+(b.keywords||[]).join(",")+". 원문 "+String(b.sourceContent||"").slice(0,5000)+". 플랫폼 "+(b.selectedPlatforms||[]).join(",")+". JSON 객체만 반환. topic,category,targetAudience,tone,selectedPlatforms 필드와 각 선택 플랫폼의 구조화 결과를 작성하세요. instagram:{caption,hashtags,callToAction,cardSlides:[{slideNumber,badge,title,subtitle,points,footerNote,imagePrompt}]}; threads:{posts}; twitterX:{tweet}; metaFacebook:{post}; shortform:{title,hook,totalDurationSec,scenes:[{sceneNumber,timeRange,visualDirection,onScreenText,spokenScript}]}");const data=parseAIJson(raw);return json({success:true,data:{...data,id:id(),createdAt:now()}});}
  catch(e){return json({success:false,error:e instanceof Error?e.message:"SNS 생성 실패"},502);}
 }
 if((path==="/api/generate-image"||path==="/api/generate-images")&&method==="POST"){
  const b:any=await request.json(),count=Math.min(8,Math.max(1,Number(b.count)||1)),prompt=String(b.prompt||b.destination||"travel photography");
  const images=Array.from({length:count},(_,i)=>({id:id(),imageUrl:"https://image.pollinations.ai/prompt/"+encodeURIComponent(prompt+" cinematic high quality photography "+(i+1))+"?width=1280&height=720&nologo=true",destination:b.destination||prompt,style:b.style||"",lighting:b.lighting||"",aspectRatio:b.aspectRatio||"16:9",prompt,createdAt:now()}));
  return json({success:true,imageUrl:images[0].imageUrl,images});
 }
 if(path==="/api/images"&&method==="GET"){
  const rows=await env.DB.prepare("SELECT id,data_json,created_at FROM generated_images WHERE user_id=? ORDER BY created_at DESC").bind(user!.id).all<any>();return json({images:rows.results.map((r:any)=>({...JSON.parse(r.data_json),id:r.id,createdAt:r.created_at}))});
 }
 if(path==="/api/images"&&method==="POST"){
  const b:any=await request.json(),img=b.image||b,imageId=String(img.id||id()),time=now();
  await env.DB.prepare("INSERT INTO generated_images(id,user_id,image_url,data_json,created_at) VALUES(?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET image_url=excluded.image_url,data_json=excluded.data_json WHERE generated_images.user_id=excluded.user_id").bind(imageId,user!.id,img.imageUrl,JSON.stringify({...img,id:imageId}),time).run();return json({ok:true,id:imageId});
 }
 if(path==="/api/images"&&method==="DELETE"){
  const imageId=url.searchParams.get("id");if(imageId)await env.DB.prepare("DELETE FROM generated_images WHERE id=? AND user_id=?").bind(imageId,user!.id).run();else await env.DB.prepare("DELETE FROM generated_images WHERE user_id=?").bind(user!.id).run();return json({ok:true});
 }
 if(path==="/api/sns-packages"&&method==="GET"){
  const rows=await env.DB.prepare("SELECT id,data_json FROM sns_packages WHERE user_id=? ORDER BY updated_at DESC").bind(user!.id).all<any>();return json({packages:rows.results.map((r:any)=>({...JSON.parse(r.data_json),id:r.id}))});
 }
 if(path==="/api/sns-packages"&&method==="POST"){
  const b:any=await request.json(),pkg=b.package||b,pkgId=String(pkg.id||id()),time=now();await env.DB.prepare("INSERT INTO sns_packages(id,user_id,source_blog_id,topic,status,scheduled_at,data_json,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET topic=excluded.topic,status=excluded.status,scheduled_at=excluded.scheduled_at,data_json=excluded.data_json,updated_at=excluded.updated_at WHERE sns_packages.user_id=excluded.user_id").bind(pkgId,user!.id,pkg.sourceBlogId||null,pkg.topic||"",pkg.status||"draft",pkg.scheduledAt||null,JSON.stringify({...pkg,id:pkgId}),pkg.createdAt||time,time).run();return json({ok:true,id:pkgId});
 }
 if(path==="/api/sns-packages"&&method==="DELETE"){
  const pkgId=url.searchParams.get("id");if(pkgId)await env.DB.prepare("DELETE FROM sns_packages WHERE id=? AND user_id=?").bind(pkgId,user!.id).run();return json({ok:true});
 }
 if(path==="/api/topic-bookmarks"&&method==="GET"){
  const rows=await env.DB.prepare("SELECT id,data_json FROM topic_bookmarks WHERE user_id=? ORDER BY created_at DESC").bind(user!.id).all<any>();return json({topics:rows.results.map((r:any)=>({...JSON.parse(r.data_json),id:r.id}))});
 }
 if(path==="/api/topic-bookmarks"&&method==="POST"){
  const b:any=await request.json(),topic=b.topic||b,topicId=String(topic.id||id());await env.DB.prepare("INSERT INTO topic_bookmarks(id,user_id,category,data_json,created_at) VALUES(?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET data_json=excluded.data_json WHERE topic_bookmarks.user_id=excluded.user_id").bind(topicId,user!.id,topic.category||"travel",JSON.stringify({...topic,id:topicId}),now()).run();return json({ok:true,id:topicId});
 }
 if(path==="/api/topic-bookmarks"&&method==="DELETE"){
  const topicId=url.searchParams.get("id");if(topicId)await env.DB.prepare("DELETE FROM topic_bookmarks WHERE id=? AND user_id=?").bind(topicId,user!.id).run();return json({ok:true});
 }
 return json({error:"Not found",path},404);
}
export default {async fetch(request:Request,env:Env):Promise<Response>{
 const url=new URL(request.url);
 if(url.pathname.startsWith("/api/")){try{return await api(request,env,url);}catch(e){console.error("Wanderlust API error",e);return json({error:e instanceof Error?e.message:"Internal server error"},500);}}
 if(url.pathname!=="/"&&url.pathname.endsWith("/"))return Response.redirect(new URL(url.pathname.replace(/\/+$/,"")+url.search,url),308);
 if(path==="/sitemap.xml"&&method==="GET"){
  const rows=await env.DB.prepare("SELECT id,updated_at FROM posts WHERE is_public=1 ORDER BY updated_at DESC LIMIT 500").all<any>();
  const urls=rows.results.map((p:any)=>`<url><loc>${url.origin}/blog/${encodeURIComponent(p.id)}</loc><lastmod>${p.updated_at}</lastmod></url>`).join("");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${url.origin}/</loc></url><url><loc>${url.origin}/blog</loc></url>${urls}</urlset>`,{headers:{"content-type":"application/xml; charset=utf-8","cache-control":"public, max-age=300"}});
 }
 if(path==="/robots.txt"&&method==="GET")return new Response("User-agent: *\nAllow: /\nSitemap: "+url.origin+"/sitemap.xml",{headers:{"content-type":"text/plain; charset=utf-8"}});
 const blogPath=path.match(/^\/blog\/([^/]+)$/);
 if(blogPath&&method==="GET"){
  const post=await env.DB.prepare("SELECT data_json FROM posts WHERE id=? AND is_public=1").bind(decodeURIComponent(blogPath[1])).first<{data_json:string}>();
  if(post){
   const data=JSON.parse(post.data_json),html=await env.ASSETS.fetch(new Request(new URL("/",url),request)),source=await html.text();
   const title=String(data.title||"Wanderlust AI").replace(/[&<>"]/g,(c:string)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]||c));
   const description=String(data.seoDescription||data.subtitle||"").replace(/[&<>"]/g,(c:string)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]||c));
   const image=String(data.coverImageUrl||"");
   const meta=`<title>${title} | Wanderlust AI</title><meta name="description" content="${description}"><meta property="og:type" content="article"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}">${image?`<meta property="og:image" content="${image}">`:""}<link rel="canonical" href="${url.origin}${path}"><script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"BlogPosting","headline":data.title,"description":data.seoDescription||data.subtitle,"image":image||undefined,"datePublished":data.createdAt,"dateModified":data.updatedAt})}</script>`;
   const output=source.replace(/<title>[\s\S]*?<\/title>/i,meta);
   return new Response(output,{headers:{"content-type":"text/html; charset=utf-8","cache-control":"public, max-age=60"}});
  }
 }
 return env.ASSETS.fetch(request);
}};
