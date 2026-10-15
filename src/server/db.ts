import config from "../../firebase-applet-config.json";
import type { BlogPost } from "../types.js";

// Public reads use Firestore REST, including the project's named database.
// No browser login or service-account file is required.
const projectId = process.env.VITE_FIREBASE_PROJECT_ID || config.projectId;
const databaseId = process.env.VITE_FIREBASE_DATABASE_ID || config.firestoreDatabaseId || "(default)";
const apiKey = process.env.VITE_FIREBASE_API_KEY || config.apiKey;
export type { BlogPost };

export function isoDate(value: any): string | undefined {
  if (!value) return undefined;
  const raw = value?.toDate ? value.toDate() : typeof value === "object" && (value.seconds != null || value._seconds != null)
    ? Number(value.seconds ?? value._seconds) * 1000 : value;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export function isPublished(data: any, now = Date.now()): boolean {
  if ((data.status || "published") !== "published" || data.isPublic === false) return false;
  const publishAt = isoDate(data.publishAt || data.scheduledAt || data.createdAt);
  return !publishAt || Date.parse(publishAt) <= now;
}

function decode(value: any): any {
  if ("nullValue" in value) return null;
  if ("arrayValue" in value) return (value.arrayValue.values || []).map(decode);
  if ("mapValue" in value) return Object.fromEntries(Object.entries(value.mapValue.fields || {}).map(([k,v]) => [k, decode(v)]));
  for (const key of ["stringValue", "booleanValue", "timestampValue", "doubleValue"]) if (key in value) return value[key];
  if ("integerValue" in value) return Number(value.integerValue);
  return null;
}

function mapPost(document: any): BlogPost {
  const data: any = Object.fromEntries(Object.entries(document.fields || {}).map(([k,v]) => [k, decode(v)]));
  return {
    ...data, id: document.name.split("/").pop(), title: data.title || "",
    markdownContent: data.markdownContent || "", status: data.status || "published",
    isPublic: data.isPublic !== false,
    createdAt: isoDate(data.createdAt) || document.createTime,
    updatedAt: isoDate(data.updatedAt) || document.updateTime || document.createTime,
  } as BlogPost;
}

async function queryPublic(field: string, id?: string): Promise<BlogPost[]> {
  const result: BlogPost[] = [];
  let cursor: string | undefined;
  do {
    const filters: any[] = [{ fieldFilter: { field: { fieldPath: field }, op: "EQUAL", value: field === "isPublic" ? { booleanValue: true } : { stringValue: "published" } } }];
    if (id) filters.push({ fieldFilter: { field: { fieldPath: "__name__" }, op: "EQUAL", value: { referenceValue: `projects/${projectId}/databases/${databaseId}/documents/travel_blog_posts/${id}` } } });
    const structuredQuery: any = {
      from: [{ collectionId: "travel_blog_posts" }],
      where: filters.length === 1 ? filters[0] : { compositeFilter: { op: "AND", filters } },
      orderBy: [{ field: { fieldPath: "__name__" }, direction: "ASCENDING" }], limit: 100,
    };
    if (cursor) structuredQuery.startAt = { values: [{ referenceValue: cursor }], before: false };
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents:runQuery?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ structuredQuery }), signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) throw new Error(`Public Firestore query failed (${response.status}): ${(await response.text()).slice(0, 400)}`);
    const rows: any[] = await response.json();
    const documents = rows.flatMap(row => row.document ? [row.document] : []);
    result.push(...documents.map(mapPost).filter(post => isPublished(post)));
    cursor = documents.length === 100 && !id ? documents.at(-1).name : undefined;
  } while (cursor);
  return result;
}

export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  const [visible, published] = await Promise.all([queryPublic("isPublic", id), queryPublic("status", id)]);
  return visible[0] || published[0] || null;
}

export async function getAllPublicBlogPosts(): Promise<BlogPost[]> {
  // Security rules require a public predicate; unfiltered collection reads are denied.
  const groups = await Promise.all([queryPublic("isPublic"), queryPublic("status")]);
  const posts = [...new Map(groups.flat().map(post => [post.id, post])).values()];
  return posts.sort((a,b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}
