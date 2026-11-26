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
  let title=get("title");const link=get("link"),pubDate=get("pubDate");let source=get("source");const sourceSep=title.lastIndexOf(" - ");if(!source&&sourceSep>0){source=title.slice(sourceSep+3).trim();title=title.slice(0,sourceSep).trim();}
  return {title,link,pubDate,source:source||"구글 뉴스"};
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
 if(path==="/api/templates/recommend"&&method==="POST"){
  const b:any=await request.json(),category=String(b.category||"travel"),input=String(b.inputSearch||"");
  const prompt=`한국어 전문 블로그 콘텐츠 전략가로서 ${category} 카테고리의 고품질 글쓰기 템플릿 6개를 추천하세요.
사용자 검색어: ${input||"자유 추천"}
사용자 맥락: ${b.userContext||"실용적이고 감성적인 여행·생활 콘텐츠"}
각 추천은 구체적인 제목, 설명, 목적지/주제, 여행 스타일, 기간, 키워드, 아이콘, 추천 이유를 포함하세요. 검색량이나 실시간 순위를 확인한 것처럼 꾸며내지 말고 콘텐츠 기획 관점의 추천이라고 설명하세요.
JSON 배열만 반환하세요. 각 객체 필드: id,title,category,destination,travelStyle,icon,description,duration,keywords(문자열 배열),reason.`;
  try{const raw=await gemini(env,prompt),templates=parseAIJson(raw);if(!Array.isArray(templates))throw new Error("템플릿 응답 형식이 올바르지 않습니다.");return json({success:true,templates});}
  catch(e){return json({success:false,error:e instanceof Error?e.message:"템플릿 추천 실패"},502);}
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
  const category=String(b.categoryType||"travel"),topic=String(b.destination),keywords=(b.keywords||[]).join(", ");
  const prompt=`당신은 한국어 전문 여행·라이프스타일 매거진 편집자이자 네이버/구글 SEO 콘텐츠 전략가입니다.
주제: ${topic}
콘텐츠 유형: ${category}
기간/소요시간: ${b.duration||"주제에 적합하게 판단"}
스타일: ${b.travelStyle||"실용적이고 감성적인 전문 에디터"}
핵심 키워드: ${keywords}
세부 장소/정보: ${b.specificSpots||"주제에 맞게 선정"}
타깃 독자: ${b.targetAudience||"일반 독자"}
문체: ${b.tone||"친근하고 신뢰감 있는 한국어"}
언어: ${b.language||"한국어"}

작성 규칙:
1. 검색 의도에 직접 답하는 구체적인 제목과 2문장 요약을 작성하세요.
2. 본문은 최소 1,800자 이상으로 작성하고 도입, 핵심 정보, 단계별 설명, 실전 팁, FAQ, 결론을 논리적으로 구성하세요.
3. 여행은 일정별 Day/시간대, 이동 동선, 명소, 교통, 예산, 계절 정보를 포함하세요. 맛집은 메뉴·가격대·웨이팅·주차·방문 시간 등 확인이 필요한 항목을 사실처럼 꾸며내지 말고 확인 필요라고 표시하세요. 생활정보는 준비물, 단계별 실행법, 주의사항, 비용 절감 팁을 포함하세요. 트렌드는 현상·배경·참여 방법·주의사항을 구분하세요.
4. 네이버 검색을 위해 메인 키워드를 제목과 소제목 및 본문에 자연스럽게 배치하고, 구글 검색을 위해 명확한 H2/H3 구조와 요약·FAQ를 포함하세요. 키워드 반복 도배는 금지합니다.
5. 근거가 확인되지 않은 실시간 순위, 가격, 운영시간, 정책, 통계를 단정하지 마세요. 추측 정보는 추정 또는 확인 필요로 표시하세요.
6. 본문에는 이미지 삽입 위치를 [사진: 장면 설명] 형식으로 3~5곳 표시하세요.
7. JSON만 출력하세요. 마크다운 코드펜스나 설명문은 붙이지 마세요.

반드시 다음 JSON 필드를 포함하세요:
title, subtitle, destination, duration, concept, tone, targetAudience, budget, season,
metaKeywords(문자열 배열), hashtags(# 포함 문자열 배열),
itinerary(배열: day, title, activities; activities는 time, spot, description, tip, photoPrompt),
markdownContent(완성된 본문 문자열), travelTips(문자열 배열), seoDescription(검색 결과용 120~160자 요약).`;
  try{const raw=await gemini(env,prompt);const data=parseAIJson(raw);if(!data.title||!data.markdownContent)throw new Error("AI 응답에 제목 또는 본문이 없습니다.");return json({success:true,data});}
  catch(e){return json({success:false,error:e instanceof Error?e.message:"블로그 생성 실패"},502);}
 }
 if(path==="/api/generate-sns"&&method==="POST"){
  const b:any=await request.json();if(!b.topic)return json({error:"SNS 주제를 입력해 주세요."},400);
  const platforms=(b.selectedPlatforms||["instagram","threads"]) as string[];
  const prompt=`당신은 여행·라이프스타일 분야의 상위 인플루언서이자 플랫폼별 SNS 콘텐츠 디렉터입니다.
주제: ${b.topic}
카테고리: ${b.category||"travel"}
타깃: ${b.targetAudience||"2030 여행·정보 탐색 독자"}
톤: ${b.tone||"친근하고 트렌디한 인플루언서"}
키워드: ${(b.keywords||[]).join(", ")}
원본 블로그: ${b.sourceBlogTitle||""}
원문 내용: ${String(b.sourceContent||"").slice(0,6000)}
생성 플랫폼: ${platforms.join(", ")}

플랫폼별 작성 규칙:
- instagram: 저장을 유도하는 강한 첫 문장, 실용적인 캡션, CTA, 해시태그 8~15개, 정확히 4장의 카드 슬라이드. 각 슬라이드는 slideNumber,badge,title,subtitle,points(2~4개),footerNote,imagePrompt 필드 포함. 1장은 후킹, 2~3장은 핵심 정보, 4장은 요약/CTA.
- threads: 자연스럽고 대화체인 연속 게시물 정확히 3개. 첫 글은 공감/후킹, 두 번째는 유용한 정보, 세 번째는 질문 또는 대화 유도.
- twitterX: 250자 이내의 밀도 높은 단일 게시물. 핵심 사실과 반응 유도.
- metaFacebook: 맥락과 실용 정보를 충분히 설명하는 커뮤니티 친화형 게시물, 문단과 질문 포함.
- shortform: 릴스/쇼츠/틱톡용 20~35초 구성. title,hook,totalDurationSec,scenes 배열. 각 씬은 sceneNumber,timeRange,visualDirection,onScreenText,spokenScript 필드 포함. 시작 3초 후킹 필수.

선택하지 않은 플랫폼의 결과는 만들지 마세요. 원문이 제공되면 사실관계와 핵심 메시지를 보존하고 플랫폼에 맞게 재구성하세요. JSON 객체만 출력하고 코드펜스나 설명문은 금지합니다.
필수 공통 필드: topic,category,targetAudience,tone,selectedPlatforms.
instagram:{caption,hashtags,callToAction,cardSlides}; threads:{posts}; twitterX:{tweet}; metaFacebook:{post}; shortform:{title,hook,totalDurationSec,scenes}.`;
  try{const raw=await gemini(env,prompt);const data=parseAIJson(raw);return json({success:true,data:{...data,id:id(),createdAt:now(),selectedPlatforms:platforms}});}
  catch(e){return json({success:false,error:e instanceof Error?e.message:"SNS 생성 실패"},502);}
 }
 if((path==="/api/generate-image"||path==="/api/generate-images")&&method==="POST"){
  const b:any=await request.json(),count=path==="/api/generate-image"?1:Math.min(3,Math.max(1,Number(b.count)||1));
  const destination=String(b.destination||b.prompt||"travel scenery"),style=String(b.style||"cinematic travel photography"),lighting=String(b.lighting||"natural light"),aspect=String(b.aspectRatio||"16:9");
  let width=1280,height=720;if(aspect==="1:1"){width=1024;height=1024;}else if(aspect==="4:3"){width=1024;height=768;}else if(aspect==="9:16"){width=720;height=1280;}
  let englishPrompt=String(b.prompt||destination);
  try{const translated=await gemini(env,"Convert this travel/lifestyle image request into concise English photography keywords, max 15 words, no quotes: "+destination+"; style "+style+"; lighting "+lighting+"; details "+String(b.customDetail||""));if(translated.trim().length>5&&!/[가-힣]/.test(translated))englishPrompt=translated.trim();}catch(error){console.warn("Image prompt translation fallback",error);}
  const images=Array.from({length:count},(_,i)=>{const prompt=englishPrompt+" "+style+" "+lighting+" high quality editorial photography variation "+(i+1);const seed=Math.floor(Math.random()*800000)+100000+i*99;const imageUrl="https://image.pollinations.ai/prompt/high%20quality%20photography%20"+encodeURIComponent(prompt.replace(/[^a-zA-Z0-9\s,]/g,""))+"?width="+width+"&height="+height+"&seed="+seed+"&nologo=true&model=flux";return {id:id(),imageUrl,url:imageUrl,destination,style,lighting,aspectRatio:aspect,prompt,createdAt:now()};});
  return json(path==="/api/generate-image"?{success:true,imageUrl:images[0].imageUrl}:{success:true,images});
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
