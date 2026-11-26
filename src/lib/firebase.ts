import { BlogPost, GeneratedImage, UserProfile, ScheduledTask } from "../types";

type CloudUser = {uid:string;email:string|null;displayName:string|null;photoURL:string|null;};
const api=async(path:string,init:RequestInit={})=>{
 const response=await fetch(path,{...init,credentials:"include",headers:{"content-type":"application/json",...(init.headers||{})},cache:"no-store"});
 const data:any=await response.json().catch(()=>({}));
 if(!response.ok)throw Object.assign(new Error(data.error||"요청 처리에 실패했습니다."),{status:response.status,code:data.code});
 return data;
};
let currentUser:CloudUser|null=null;
const listeners=new Set<(user:CloudUser|null)=>void>();
const emit=()=>listeners.forEach(fn=>fn(currentUser));
export const auth={currentUser:null as CloudUser|null,authStateReady:async()=>{await refreshAuth();}};
export const firebaseConfig={projectId:"wanderlust-ai-cloudflare",firestoreDatabaseId:"D1",authDomain:"Cloudflare Workers"};
async function refreshAuth(){try{const data=await api("/api/auth/me");currentUser=data.user?{uid:data.user.id,email:data.user.email,displayName:data.user.displayName,photoURL:null}:null;}catch{currentUser=null;}auth.currentUser=currentUser;emit();return currentUser;}
export function onAuthStateChanged(_auth:any,callback:(user:CloudUser|null)=>void){listeners.add(callback);refreshAuth().then(()=>callback(currentUser));return()=>listeners.delete(callback);}
export async function ensureAuth(){return currentUser||await refreshAuth();}
export async function loginWithEmail(email:string,pass:string){const d=await api("/api/auth/login",{method:"POST",body:JSON.stringify({email,password:pass})});currentUser={uid:d.user.id,email:d.user.email,displayName:d.user.displayName,photoURL:null};auth.currentUser=currentUser;emit();return currentUser;}
export async function signUpWithEmail(email:string,pass:string,displayName="여행 작가"){const d=await api("/api/auth/register",{method:"POST",body:JSON.stringify({email,password:pass,displayName})});currentUser={uid:d.user.id,email:d.user.email,displayName:d.user.displayName,photoURL:null};auth.currentUser=currentUser;emit();return currentUser;}
export async function logoutUser(){await api("/api/auth/logout",{method:"POST"});currentUser=null;auth.currentUser=null;emit();}
export async function loginWithGoogle(){throw new Error("Google OAuth 연동은 Cloudflare 버전에서 별도 설정이 필요합니다. 이메일 로그인을 이용해 주세요.");}
const POSTS_KEY="wanderlust_travel_posts_db",IMAGES_KEY="wanderlust_travel_gallery_images_db";
export function getLocalPosts():BlogPost[]{try{return JSON.parse(localStorage.getItem(POSTS_KEY)||"[]");}catch{return[];}}
export function saveLocalPost(post:BlogPost){const rows=getLocalPosts(),i=rows.findIndex(x=>x.id===post.id);if(i>=0)rows[i]=post;else rows.unshift(post);localStorage.setItem(POSTS_KEY,JSON.stringify(rows));}
export function deleteLocalPost(id:string){localStorage.setItem(POSTS_KEY,JSON.stringify(getLocalPosts().filter(x=>x.id!==id)));}
export function getLocalImages():GeneratedImage[]{try{return JSON.parse(localStorage.getItem(IMAGES_KEY)||"[]");}catch{return[];}}
export function saveLocalImage(img:GeneratedImage){const rows=getLocalImages(),i=rows.findIndex(x=>x.id===img.id);if(i>=0)rows[i]=img;else rows.unshift(img);localStorage.setItem(IMAGES_KEY,JSON.stringify(rows));}
export function deleteLocalImage(id:string){localStorage.setItem(IMAGES_KEY,JSON.stringify(getLocalImages().filter(x=>x.id!==id)));}
export function mapDocToBlogPost(id:string,data:any):BlogPost{return {...data,id};}
export async function savePostToFirestore(post:Omit<BlogPost,"id">&{id?:string}){const idValue=post.id||crypto.randomUUID();const isExisting=Boolean(post.id&&getLocalPosts().some((item)=>item.id===post.id));const full={...post,id:idValue,...(!isExisting?{status:"draft" as const,isPublic:false}:{})};await api("/api/posts",{method:"POST",body:JSON.stringify({post:full})});saveLocalPost(full as BlogPost);return idValue;}
export async function fetchPostsFromFirestore(){if(!await ensureAuth())return [];const d=await api("/api/posts");const posts=d.posts||[];localStorage.setItem(POSTS_KEY,JSON.stringify(posts));return posts as BlogPost[];}
export async function fetchBlogsFromServer(){return fetchPostsFromFirestore();}
export async function fetchPublishedPostsFromServer(){const d=await api("/api/posts/published");return (d.posts||[]) as BlogPost[];}
export async function deletePostFromFirestore(id:string){await api("/api/posts?id="+encodeURIComponent(id),{method:"DELETE"});deleteLocalPost(id);}
export async function publishPostAtomic(post:BlogPost){await api("/api/posts",{method:"POST",body:JSON.stringify({post:{...post,status:"published",isPublic:true}})});}
export async function unpublishPostAtomic(id:string){const post=getLocalPosts().find(p=>p.id===id);if(post)await api("/api/posts",{method:"POST",body:JSON.stringify({post:{...post,status:"draft",isPublic:false}})});}
export function subscribeToBlogs(onNext:(posts:BlogPost[])=>void,onError:(err:any)=>void){let active=true;if(!currentUser){onNext([]);return()=>{active=false;};}const load=()=>fetchPostsFromFirestore().then(v=>{if(active)onNext(v)}).catch(e=>{if(active)onError(e)});load();const timer=setInterval(load,60000);return()=>{active=false;clearInterval(timer)};}
export function subscribeToPublishedPosts(onNext:(posts:BlogPost[])=>void,onError:(err:any)=>void){let active=true;const load=()=>fetchPublishedPostsFromServer().then(v=>{if(active)onNext(v)}).catch(e=>{if(active)onError(e)});load();const timer=setInterval(load,60000);return()=>{active=false;clearInterval(timer)};}
export async function checkFirestoreConnection(){try{await api("/api/health");return true}catch{return false;}}
export async function saveImageToFirestore(img:GeneratedImage){const d=await api("/api/images",{method:"POST",body:JSON.stringify({image:img})});saveLocalImage({...img,id:d.id});return d.id;}
export async function saveMultipleImagesToFirestore(images:GeneratedImage[]){for(const img of images)await saveImageToFirestore(img);}
export async function fetchImagesFromFirestore(){if(!await ensureAuth())return [];const d=await api("/api/images");const images=d.images||[];localStorage.setItem(IMAGES_KEY,JSON.stringify(images));return images as GeneratedImage[];}
export async function deleteImageFromFirestore(id:string){await api("/api/images?id="+encodeURIComponent(id),{method:"DELETE"});deleteLocalImage(id);}
export async function clearAllImagesFromFirestore(){await api("/api/images",{method:"DELETE"});localStorage.setItem(IMAGES_KEY,"[]");}
export async function linkImageToBlogInFirestore(imageId:string,blogId:string,blogTitle:string,_isCover?:boolean){const images=getLocalImages();const img=images.find(x=>x.id===imageId);if(img)await saveImageToFirestore({...img,linkedBlogId:blogId,linkedBlogTitle:blogTitle});}
export async function saveScheduledTaskToFirestore(task:ScheduledTask){await api("/api/scheduled",{method:"POST",body:JSON.stringify({task})});}
export async function fetchScheduledTasksFromFirestore(){if(!await ensureAuth())return [];const d=await api("/api/scheduled");return (d.tasks||[]) as ScheduledTask[];}
export async function deleteScheduledTaskFromFirestore(id:string){await api("/api/scheduled?id="+encodeURIComponent(id),{method:"DELETE"});}
export async function fetchSnsPackages(){if(!await ensureAuth())return [];const d=await api("/api/sns-packages");return d.packages||[];}
export async function saveSnsPackage(pkg:any){return api("/api/sns-packages",{method:"POST",body:JSON.stringify({package:pkg})});}
export async function deleteSnsPackage(id:string){return api("/api/sns-packages?id="+encodeURIComponent(id),{method:"DELETE"});}
export async function fetchTopicBookmarks(){if(!await ensureAuth())return [];const d=await api("/api/topic-bookmarks");return d.topics||[];}
export async function saveTopicBookmark(topic:any){return api("/api/topic-bookmarks",{method:"POST",body:JSON.stringify({topic})});}
export async function deleteTopicBookmark(id:string){return api("/api/topic-bookmarks?id="+encodeURIComponent(id),{method:"DELETE"});}

export async function claimDueScheduledTasks(){const d=await api("/api/scheduled/due",{method:"POST",body:"{}"});return (d.tasks||[]) as ScheduledTask[];}
