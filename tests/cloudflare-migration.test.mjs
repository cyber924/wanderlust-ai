import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("Cloudflare Worker exposes D1-backed service APIs", async () => {
  const worker = await read("../src/worker.ts");
  for (const route of ["/api/auth/register", "/api/auth/login", "/api/posts", "/api/posts/published", "/api/images", "/api/sns-packages", "/api/topic-bookmarks", "/api/scheduled/due", "/api/google-news", "/api/generate-blog", "/api/generate-sns", "/api/templates/recommend"]) {
    assert.ok(worker.includes(route), `missing route ${route}`);
  }
});

test("deferred publishing is visit-triggered and does not use Cron", async () => {
  const app = await read("../src/App.tsx");
  const worker = await read("../src/worker.ts");
  const wrangler = await read("../wrangler.toml");
  assert.ok(app.includes('activeTab === "scheduling"'));
  assert.ok(app.includes("claimDueScheduledTasks()"));
  assert.ok(worker.includes("status='pending' AND scheduled_at<=?"));
  assert.ok(worker.includes("status='processing'"));
  assert.ok(!wrangler.includes("[triggers]"));
  assert.ok(!app.includes("setInterval(scanScheduledTasks"));
});

test("Google News failures are explicit and never replaced with fake headlines", async () => {
  const worker = await read("../src/worker.ts");
  assert.ok(worker.includes("Google News RSS"));
  assert.ok(worker.includes("articles:[]"));
  assert.ok(worker.includes("},502)"));
});

test("SNS archive and research bookmarks use D1 API adapter", async () => {
  const client = await read("../src/lib/firebase.ts");
  const sns = await read("../src/components/SNSStudio.tsx");
  const research = await read("../src/components/PreInvestigation.tsx");
  assert.ok(client.includes("/api/sns-packages"));
  assert.ok(client.includes("/api/topic-bookmarks"));
  assert.ok(sns.includes("fetchSnsPackages"));
  assert.ok(research.includes("fetchTopicBookmarks"));
});

test("Cloudflare build outputs Vite static assets", async () => {
  const pkg = JSON.parse(await read("../package.json"));
  assert.equal(pkg.scripts.build, "vite build");
  assert.ok((await read("../wrangler.toml")).includes('directory = "./dist"'));
});
