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
    .replace(/[#*`_~\[\]()\-+=>!]/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
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

  const post = await getBlogPostById(postId);
  const now = new Date();
  
  const isValid = post && 
    post.status === "published" && 
    (post.isPublic !== false) && 
    new Date(post.createdAt) <= now;

  if (!isValid) {
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
      '<div id="root"></div>',
      '<div id="root"><div style="padding:80px 20px;text-align:center;font-family:sans-serif;"><h1 style="font-size:2rem;color:#1c1917;margin-bottom:12px;">404 - 글을 찾을 수 없습니다</h1><p style="color:#57534e;margin-bottom:24px;">요청하신 발행 글이 존재하지 않거나 비공개 상태입니다.</p><a href="/blog" style="background:#2563eb;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;">공개 웹진 목록으로 돌아가기</a></div></div>'
    );
    return res.send(modifiedHtml);
  }

  res.status(200);

  const postTitle = post.title;
  const postDesc = post.seoDescription || cleanText(post.markdownContent || "", 140);
  const postImage = post.coverImageUrl || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80";
  const postUrl = `${baseUrl}/blog/${post.id}`;
  const datePublished = new Date(post.createdAt).toISOString();
  const dateModified = new Date(post.updatedAt || post.createdAt).toISOString();

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
      "name": post.authorName || "Wanderlust AI"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Wanderlust AI",
      "url": baseUrl
    }
  };

  let modifiedHtml = html;

  modifiedHtml = modifiedHtml.replace(
    "<title>Wanderlust AI - 여행 블로그 자동화</title>",
    `<title>${postTitle} | Wanderlust AI</title>`
  );

  const additionalHeads = `
    <link rel="canonical" href="${postUrl}" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${postTitle.replace(/"/g, '&quot;')}" />
    <meta property="og:description" content="${postDesc.replace(/"/g, '&quot;')}" />
    <meta property="og:image" content="${postImage}" />
    <meta property="og:url" content="${postUrl}" />
    <meta property="article:published_time" content="${datePublished}" />
    <meta property="article:modified_time" content="${dateModified}" />
    <script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
    </script>
    <script>
      window.__INITIAL_POST__ = ${JSON.stringify(post)};
    </script>
  `;

  modifiedHtml = modifiedHtml.replace("</head>", `${additionalHeads}\n  </head>`);

  const ssrContent = `
    <div style="max-width:800px;margin:40px auto;padding:20px;font-family:sans-serif;color:#1c1917;">
      <nav style="margin-bottom:20px;"><a href="/blog" style="color:#2563eb;text-decoration:none;font-weight:600;">← 웹진 목록으로 돌아가기</a></nav>
      <article>
        <h1 style="font-size:2.25rem;font-weight:bold;margin-bottom:12px;line-height:1.3;">${postTitle}</h1>
        <p style="font-size:1.125rem;color:#57534e;margin-bottom:20px;">${post.subtitle || ''}</p>
        <div style="display:flex;gap:16px;color:#78716c;font-size:0.875rem;margin-bottom:24px;border-bottom:1px solid #e7e5e4;padding-bottom:16px;">
          <span>✍️ ${post.authorName || 'Wanderlust 에디터'}</span>
          <span>📅 ${new Date(post.createdAt).toLocaleDateString()}</span>
        </div>
        ${postImage ? `<img src="${postImage}" alt="${postTitle}" style="width:100%;height:400px;object-fit:cover;border-radius:12px;margin-bottom:24px;" />` : ''}
        <div style="line-height:1.8;color:#292524;white-space:pre-wrap;">${post.markdownContent || ''}</div>
      </article>
    </div>
  `;

  modifiedHtml = modifiedHtml.replace('<div id="root"></div>', `<div id="root">${ssrContent}</div>`);

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

  let posts: any[] = [];
  try {
    posts = await getAllPublicBlogPosts();
  } catch (err) {
    console.error("Error fetching posts for static SSR page:", err);
  }

  let modifiedHtml = html;
  modifiedHtml = modifiedHtml.replace(
    "</head>",
    `    <link rel="canonical" href="${canonicalUrl}" />\n    <meta property="og:url" content="${canonicalUrl}" />\n  </head>`
  );

  if (posts.length > 0) {
    const postsHtml = `
      <div style="max-width:1200px;margin:0 auto;padding:40px 20px;font-family:sans-serif;">
        <header style="text-align:center;margin-bottom:40px;">
          <h1 style="font-size:2.5rem;font-weight:bold;color:#1c1917;margin-bottom:12px;">Wanderlust AI 공개 웹진</h1>
          <p style="font-size:1.125rem;color:#57534e;">AI가 실시간으로 분석하고 발행한 생생한 여행 및 생활정보 가이드</p>
        </header>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:24px;">
          ${posts.map(p => `
            <div style="background:#fff;border:1px solid #e7e5e4;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px -1px rgb(0 0 0 / 0.1);">
              ${p.coverImageUrl ? `<img src="${p.coverImageUrl}" alt="${p.title}" style="width:100%;height:200px;object-fit:cover;" />` : ''}
              <div style="padding:20px;">
                <h2 style="font-size:1.25rem;font-weight:bold;margin-bottom:8px;line-height:1.4;">
                  <a href="/blog/${p.id}" style="color:#1c1917;text-decoration:none;">${p.title}</a>
                </h2>
                <p style="font-size:0.95rem;color:#57534e;margin-bottom:16px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${p.seoDescription || p.subtitle || ''}</p>
                <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.85rem;color:#78716c;border-top:1px solid #f5f5f4;padding-top:12px;">
                  <span>✍️ ${p.authorName || 'Wanderlust 에디터'}</span>
                  <a href="/blog/${p.id}" style="color:#2563eb;font-weight:600;text-decoration:none;">자세히 보기 →</a>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    modifiedHtml = modifiedHtml.replace('<div id="root"></div>', `<div id="root">${postsHtml}</div>`);
    modifiedHtml = modifiedHtml.replace(
      '</head>',
      `  <script>window.__INITIAL_POSTS__ = ${JSON.stringify(posts)};</script>\n  </head>`
    );
  }

  res.status(200).send(modifiedHtml);
}
