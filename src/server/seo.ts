import fs from "fs";
import path from "path";
import { getBlogPostById, getAllPublicBlogPosts } from "./db.js";

function getBaseUrl(req: any): string {
  const protocol = req.headers["x-forwarded-proto"] || req.protocol || "http";
  const host = req.get("host") || "localhost:3000";
  return `${protocol}://${host}`;
}

function cleanText(markdown: string | undefined, limit: number = 140): string {
  if (!markdown) return "";
  const plainText = markdown
    .replace(/[#*`_~\[\]()\-+=>!]/g, " ") // replace markdown syntax with space
    .replace(/<[^>]*>/g, " ")             // replace HTML tags with space
    .replace(/\s+/g, " ")                 // collapse whitespace
    .trim();
  
  if (plainText.length <= limit) return plainText;
  return plainText.slice(0, limit) + "...";
}

/**
 * Handle sitemap.xml dynamic generation
 */
export async function handleSitemap(req: any, res: any) {
  try {
    const posts = await getAllPublicBlogPosts();
    const baseUrl = getBaseUrl(req);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // 1. Homepage
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/</loc>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>1.0</priority>\n`;
    xml += `  </url>\n`;

    // 2. Blog archive
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/blog</loc>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>0.9</priority>\n`;
    xml += `  </url>\n`;

    // 3. Blog Posts
    for (const post of posts) {
      // Find the last modified date based on priority: updatedAt -> modifiedAt -> publishedAt -> createdAt
      const rawDate = post.updatedAt || post.createdAt;
      const lastmod = new Date(rawDate).toISOString();

      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/blog/${post.id}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    }

    xml += `</urlset>`;

    res.header("Content-Type", "application/xml; charset=utf-8");
    res.status(200).send(xml);
  } catch (error) {
    console.error("Error generating sitemap.xml:", error);
    res.status(500).send("Error generating sitemap");
  }
}

/**
 * Handle robots.txt dynamic generation
 */
export function handleRobots(req: any, res: any) {
  const baseUrl = getBaseUrl(req);
  const robots = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
`;
  res.header("Content-Type", "text/plain; charset=utf-8");
  res.status(200).send(robots);
}

/**
 * Handle Blog Detail page HTML server-side rendering & injection
 */
export async function handleBlogDetailPage(req: any, res: any, vite?: any) {
  const postId = req.params.id;
  const baseUrl = getBaseUrl(req);
  
  // 1. Read index.html
  let html = "";
  try {
    if (process.env.NODE_ENV !== "production" && vite) {
      const templatePath = path.resolve(process.cwd(), "index.html");
      html = fs.readFileSync(templatePath, "utf-8");
      html = await vite.transformIndexHtml(req.originalUrl, html);
    } else {
      const templatePath = path.resolve(process.cwd(), "dist", "index.html");
      html = fs.readFileSync(templatePath, "utf-8");
    }
  } catch (err) {
    console.error("Error reading index.html in server-side SEO:", err);
    return res.status(500).send("Internal Server Error");
  }

  // 2. Fetch blog post
  const post = await getBlogPostById(postId);
  const now = new Date();
  
  const isValid = post && 
    post.status === "published" && 
    (post.isPublic !== false) && 
    new Date(post.createdAt) <= now;

  if (!isValid) {
    // 404 NOT FOUND!
    res.status(404);
    
    let modifiedHtml = html;
    modifiedHtml = modifiedHtml.replace(
      "<title>Wanderlust AI - 여행 블로그 자동화</title>",
      "<title>글을 찾을 수 없습니다 | Wanderlust AI</title>"
    );
    modifiedHtml = modifiedHtml.replace(
      "</head>",
      `  <meta name="robots" content="noindex, follow">\n  </head>`
    );
    modifiedHtml = modifiedHtml.replace(
      "window.__INITIAL_ERROR__ = null;",
      "window.__INITIAL_ERROR__ = \"NOT_FOUND\";"
    );
    
    return res.send(modifiedHtml);
  }

  // 200 OK!
  res.status(200);

  const postTitle = post.title;
  const postDesc = post.seoDescription || cleanText(post.markdownContent || "", 140);
  const postImage = post.coverImageUrl || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80";
  const postUrl = `${baseUrl}/blog/${post.id}`;
  const datePublished = new Date(post.createdAt).toISOString();
  const dateModified = new Date(post.updatedAt || post.createdAt).toISOString();

  // JSON-LD Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": postTitle,
    "description": postDesc,
    "image": postImage,
    "datePublished": datePublished,
    "dateModified": dateModified,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": postUrl
    },
    "author": {
      "@type": "Organization",
      "name": "Wanderlust AI"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Wanderlust AI",
      "url": baseUrl
    }
  };

  let modifiedHtml = html;

  // Replace Title & Description
  modifiedHtml = modifiedHtml.replace(
    "<title>Wanderlust AI - 여행 블로그 자동화</title>",
    `<title>${postTitle} | Wanderlust AI</title>`
  );
  modifiedHtml = modifiedHtml.replace(
    `content="AI 협업기반 여행 & 생활정보 블로그 작성, 고화질 스냅 연동, 공개 웹진 및 네이버/티스토리 출처 자동 동봉 퍼가기 플랫폼"`,
    `content="${postDesc.replace(/"/g, '&quot;')}"`
  );

  // Replace OpenGraph website/title/desc/image
  modifiedHtml = modifiedHtml.replace(
    `<meta property="og:type" content="website" />`,
    `<meta property="og:type" content="article" />`
  );
  modifiedHtml = modifiedHtml.replace(
    `<meta property="og:title" content="Wanderlust AI - 여행 블로그 자동화" />`,
    `<meta property="og:title" content="${postTitle.replace(/"/g, '&quot;')}" />`
  );
  modifiedHtml = modifiedHtml.replace(
    `<meta property="og:description" content="AI 협업기반 여행 & 생활정보 블로그 작성, 고화질 스냅 연동, 공개 웹진 및 네이버/티스토리 출처 자동 동봉 퍼가기 플랫폼" />`,
    `<meta property="og:description" content="${postDesc.replace(/"/g, '&quot;')}" />`
  );
  modifiedHtml = modifiedHtml.replace(
    `<meta property="og:image" content="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80" />`,
    `<meta property="og:image" content="${postImage}" />`
  );

  // Inject dynamic tags and structured data
  const additionalHeads = `
    <link rel="canonical" href="${postUrl}" />
    <meta property="og:url" content="${postUrl}" />
    <meta property="article:published_time" content="${datePublished}" />
    <meta property="article:modified_time" content="${dateModified}" />
    <script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
    </script>
  `;

  modifiedHtml = modifiedHtml.replace(
    "</head>",
    `${additionalHeads}\n  </head>`
  );

  modifiedHtml = modifiedHtml.replace(
    "window.__INITIAL_ERROR__ = null;",
    "window.__INITIAL_ERROR__ = null;"
  );

  return res.send(modifiedHtml);
}

/**
 * Handle static URL canonical mappings (e.g. / or /blog)
 */
export async function handleStaticPage(req: any, res: any, vite?: any) {
  const baseUrl = getBaseUrl(req);
  const pathStr = req.path;
  const canonicalUrl = `${baseUrl}${pathStr}`;

  let html = "";
  try {
    if (process.env.NODE_ENV !== "production" && vite) {
      const templatePath = path.resolve(process.cwd(), "index.html");
      html = fs.readFileSync(templatePath, "utf-8");
      html = await vite.transformIndexHtml(req.originalUrl, html);
    } else {
      const templatePath = path.resolve(process.cwd(), "dist", "index.html");
      html = fs.readFileSync(templatePath, "utf-8");
    }
  } catch (err) {
    console.error(`Error reading index.html for static path ${pathStr}:`, err);
    return res.status(500).send("Internal Server Error");
  }

  // Inject canonical and og:url
  let modifiedHtml = html;
  modifiedHtml = modifiedHtml.replace(
    "</head>",
    `    <link rel="canonical" href="${canonicalUrl}" />\n    <meta property="og:url" content="${canonicalUrl}" />\n  </head>`
  );

  res.status(200).send(modifiedHtml);
}
