import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import app from "./src/server/app";
import { handleSitemap, handleRobots, handleBlogDetailPage, handleStaticPage } from "./src/server/seo.js";

async function startServer() {
  const PORT = 3000;

  // 1. URL Trailing Slash Normalization (Permanent 301 Redirect)
  app.use((req, res, next) => {
    if (req.path !== "/" && req.path.endsWith("/")) {
      const cleanPath = req.path.slice(0, -1);
      const queryStr = req.url.slice(req.path.length);
      return res.redirect(301, cleanPath + queryStr);
    }
    next();
  });

  let vite: any = null;
  if (process.env.NODE_ENV !== "production") {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
  }

  // 2. SEO routes (XML, txt)
  app.get("/sitemap.xml", handleSitemap);
  app.get("/robots.txt", handleRobots);

  // 3. Blog detail route (server-side injection)
  app.get("/blog/:id", (req, res) => handleBlogDetailPage(req, res, vite));

  // 4. Static page routes (canonical mapping)
  app.get("/", (req, res, next) => {
    if (req.path === "/") {
      return handleStaticPage(req, res, vite);
    }
    next();
  });

  app.get("/blog", (req, res) => handleStaticPage(req, res, vite));

  // Vite middleware for development (Google AI Studio / Local)
  if (process.env.NODE_ENV !== "production") {
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
