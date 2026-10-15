import fs from "node:fs";
import path from "node:path";
import { getBlogPostById, getAllPublicBlogPosts, isoDate } from "./db.js";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80";
export const escapeHtml = (value: any = "") => String(value).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[c]!);
export const scriptJson = (value: any) => JSON.stringify(value).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
function baseUrl(req: any) {
  return (process.env.SITE_URL || `https://${req.get("host") || "wanderlust-ai-88vl.vercel.app"}`).replace(/\/$/, "");
}
async function template(req: any, vite?: any) {
  const file = vite ? "index.html" : "dist/index.html";
  let html = fs.readFileSync(path.resolve(process.cwd(), file), "utf8");
  if (vite) html = await vite.transformIndexHtml(req.originalUrl, html);
  return html.replace('lang="en"', 'lang="ko"');
}
function decorate(html: string, data: { title: string; description: string; url?: string; image?: string; article?: boolean; noindex?: boolean }, body: string, initial = "") {
  // Replace existing metadata rather than appending conflicting defaults.
  html = html.replace(/<title>[\s\S]*?<\/title>/gi, "")
    .replace(/<meta\b[^>]*(?:name|property)=["'](?:description|robots|og:[^"']+|twitter:[^"']+)["'][^>]*>/gi, "")
    .replace(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi, "");
  const e = escapeHtml;
  const head = `<title>${e(data.title)}</title>
<meta name="description" content="${e(data.description)}">
<meta name="robots" content="${data.noindex ? "noindex,follow" : "index,follow"}">
${data.url ? `<link rel="canonical" href="${e(data.url)}"><meta property="og:url" content="${e(data.url)}">` : ""}
<meta property="og:type" content="${data.article ? "article" : "website"}">
<meta property="og:title" content="${e(data.title)}"><meta property="og:description" content="${e(data.description)}">
<meta property="og:image" content="${e(data.image || FALLBACK_IMAGE)}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${e(data.title)}">
<meta name="twitter:description" content="${e(data.description)}"><meta name="twitter:image" content="${e(data.image || FALLBACK_IMAGE)}">
${initial}`;
  return html.replace("</head>", `${head}</head>`).replace('<div id="root"></div>', `<div id="root"><main style="max-width:1000px;margin:40px auto;padding:20px;font-family:sans-serif;line-height:1.8">${body}</main></div>`);
}
function respond(res: any, html: string, status = 200) {
  return res.status(status).set("Cache-Control", "no-store").type("html").send(html);
}

export async function handleSitemap(req: any, res: any) {
  try {
    const posts = await getAllPublicBlogPosts();
    const base = baseUrl(req);
    const urls = [{ url: `${base}/` }, { url: `${base}/blog` }, ...posts.map(post => ({ url: `${base}/blog/${encodeURIComponent(post.id)}`, date: isoDate(post.updatedAt || post.createdAt) }))];
    const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((item: any) => `<url><loc>${escapeHtml(item.url)}</loc>${item.date ? `<lastmod>${item.date}</lastmod>` : ""}</url>`).join("")}</urlset>`;
    res.set("Cache-Control", "no-store").type("application/xml").status(200).send(xml);
  } catch (error) {
    console.error("Sitemap read failed:", error);
    res.set("Cache-Control", "no-store").status(503).type("text").send("Sitemap temporarily unavailable");
  }
}
export function handleRobots(req: any, res: any) {
  res.type("text").status(200).send(`User-agent: *\nAllow: /\n\nSitemap: ${baseUrl(req)}/sitemap.xml\n`);
}
export async function handleBlogDetailPage(req: any, res: any, vite?: any) {
  const post = await getBlogPostById(req.params.id);
  if (!post) return handleNotFound(req, res);
  const url = `${baseUrl(req)}/blog/${encodeURIComponent(post.id)}`;
  const title = `${post.title} | Wanderlust AI`;
  const description = post.seoDescription || post.subtitle || post.markdownContent.replace(/[#*`]/g, "").slice(0, 140);
  const image = post.coverImageUrl || FALLBACK_IMAGE;
  const jsonLd = { "@context": "https://schema.org", "@type": "BlogPosting", headline: post.title, description, image, datePublished: isoDate(post.createdAt), dateModified: isoDate(post.updatedAt || post.createdAt), mainEntityOfPage: { "@type": "WebPage", "@id": url }, author: { "@type": "Organization", name: post.authorName || "Wanderlust AI" } };
  const initial = `<script type="application/ld+json">${scriptJson(jsonLd)}</script><script>window.__INITIAL_POST__=${scriptJson(post)};window.__INITIAL_POSTS__=${scriptJson([post])};</script>`;
  const body = `<nav><a href="/blog">← 공개 웹진 목록</a></nav><article><h1>${escapeHtml(post.title)}</h1><p>${escapeHtml(post.subtitle || "")}</p><img src="${escapeHtml(image)}" alt="${escapeHtml(post.title)}" style="max-width:100%;height:auto"><div style="white-space:pre-wrap">${escapeHtml(post.markdownContent)}</div></article>`;
  return respond(res, decorate(await template(req, vite), {title, description, url, image, article: true}, body, initial));
}
export async function handleStaticPage(req: any, res: any, vite?: any) {
  const posts = await getAllPublicBlogPosts();
  const title = req.path === "/blog" ? "여행·생활정보 공개 웹진 | Wanderlust AI" : "Wanderlust AI - 여행 블로그 자동화";
  const body = `<h1>Wanderlust AI 공개 웹진</h1><p>여행과 생활정보를 만나보세요.</p>${posts.length ? posts.map(post => `<article><h2><a href="/blog/${encodeURIComponent(post.id)}">${escapeHtml(post.title)}</a></h2><p>${escapeHtml(post.seoDescription || post.subtitle || "")}</p></article>`).join("") : "<p>아직 공개된 글이 없습니다.</p>"}`;
  return respond(res, decorate(await template(req, vite), { title, description: "여행과 맛집, 유용한 생활정보를 만나는 Wanderlust AI 공개 웹진", url: `${baseUrl(req)}${req.path}` }, body, `<script>window.__INITIAL_POSTS__=${scriptJson(posts)};</script>`));
}
export function handleNotFound(_req: any, res: any) {
  return respond(res, `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>페이지를 찾을 수 없습니다 | Wanderlust AI</title><meta name="robots" content="noindex,follow"></head><body><h1>404 - 페이지를 찾을 수 없습니다</h1><a href="/blog">공개 웹진으로 이동</a></body></html>`, 404);
}
