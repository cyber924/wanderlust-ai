import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, cpSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { createRequire } from 'node:module';

// Run only the actual packaged function, outside the source tree and node_modules.
const directory = mkdtempSync(join(tmpdir(), 'wanderlust-function-'));
cpSync(resolve('.vercel/output/functions/render.func'), directory, {recursive: true});
process.chdir(directory);
const app = createRequire(import.meta.url)(join(directory, 'index.cjs'));
const server = app.listen(0, '127.0.0.1');
await new Promise(r => server.once('listening', r));
const base = `http://127.0.0.1:${server.address().port}`;
let failDatabase = false;
const nativeFetch = globalThis.fetch;
const makeDocument = (id, title, extra = {}) => ({name:`projects/p/databases/d/documents/travel_blog_posts/${id}`, fields: {
 title:{stringValue:title}, status:{stringValue:'published'},isPublic:{booleanValue:true},
 markdownContent:{stringValue:'Public article body <script>bad()</script>'},createdAt:{timestampValue:'2026-01-01T00:00:00Z'}, ...extra,
}});
globalThis.fetch = async (url, options) => {
 if (String(url).startsWith('https://firestore.googleapis.com/')) {
  if (failDatabase) return new Response('unavailable', {status:503});
  const query=JSON.parse(options.body).structuredQuery;
  const name=JSON.stringify(query.where).includes('missing') || JSON.stringify(query.where).includes('private');
  return Response.json(name ? [] : [
   {document:makeDocument('live','Seoul <travel> & food')},
   {document:makeDocument('private','Draft', {isPublic:{booleanValue:false}})},
   {document:makeDocument('future','Future',{publishAt:{timestampValue:'2099-01-01T00:00:00Z'}})},
  ]);
 }
 return nativeFetch(url, options);
};
try {
 await test('isolated bundle: health, XML, robots, SSR and real 404', async () => {
  assert.equal((await fetch(`${base}/api/health`)).status,200);
  const robots=await fetch(`${base}/robots.txt`);assert.match(await robots.text(),/Sitemap: https:\/\//);
  const sitemap=await fetch(`${base}/sitemap.xml`);const xml=await sitemap.text();assert.equal(sitemap.status,200);assert.match(sitemap.headers.get('content-type'),/xml/);assert.match(xml,/\/blog\/live/);assert.doesNotMatch(xml,/private|future/);
  for (const route of ['/', '/blog', '/blog/live']) {
   const response=await fetch(`${base}${route}`);const html=await response.text();assert.equal(response.status,200);assert.match(html,/rel="canonical"/);assert.match(html,/Seoul &lt;travel&gt; &amp; food/);assert.doesNotMatch(html,/<script>bad\(\)<\/script>/);
   assert.equal((html.match(/property="og:title"/g)||[]).length,1);
   assert.match(html, /<header class="sticky/); // The actual site, not a plain SEO placeholder.
   assert.match(html, /<footer/);
   assert.match(html, /window\.__INITIAL_PAGE__=/);
   if(route !== '/blog/live') assert.match(html, /href="\/blog\/live"/);
   if(route==='/blog/live') {assert.match(html,/BlogPosting/);assert.match(html,/Public article body/);}
  }
  for (const route of ['/missing', '/blog/missing', '/blog/private']) assert.equal((await fetch(`${base}${route}`)).status,404);
  const redirect=await fetch(`${base}/blog/`,{redirect:'manual'});assert.equal(redirect.status,308);assert.equal(redirect.headers.get('location'),'/blog');
 });
 await test('database failure stays 503 instead of empty 200 or false 404', async () => {
  failDatabase=true;
  for (const route of ['/', '/blog/live','/sitemap.xml']) assert.equal((await fetch(`${base}${route}`)).status,503);
 });
} finally {globalThis.fetch=nativeFetch;server.closeAllConnections();await new Promise(r=>server.close(r));process.chdir(tmpdir());rmSync(directory,{recursive:true,force:true});}
