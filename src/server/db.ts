import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, getDoc, collection, getDocs, query, orderBy } from "firebase/firestore";
import fs from "fs";
import path from "path";
import { WEBZINE_SAMPLE_ARTICLES } from "../data/webzineSampleArticles.js";

// Load config
const configPath = path.resolve(process.cwd(), "firebase-applet-config.json");
const firebaseConfigJson = JSON.parse(fs.readFileSync(configPath, "utf-8"));

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || firebaseConfigJson.apiKey,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigJson.authDomain,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || firebaseConfigJson.projectId,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigJson.storageBucket,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigJson.messagingSenderId,
  appId: process.env.VITE_FIREBASE_APP_ID || firebaseConfigJson.appId,
  firestoreDatabaseId: process.env.VITE_FIREBASE_DATABASE_ID || firebaseConfigJson.firestoreDatabaseId || "(default)",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export interface BlogPost {
  id: string;
  title: string;
  subtitle?: string;
  markdownContent?: string;
  seoDescription?: string;
  coverImageUrl?: string;
  createdAt: string;
  updatedAt: string;
  authorName?: string;
  status?: string;
  isPublic?: boolean;
}

/**
 * Fetch a single blog post by its ID from Firestore or static samples.
 */
export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  try {
    const docRef = doc(db, "travel_blog_posts", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const status = data.status || "published";
      const isPublic = data.isPublic !== undefined ? Boolean(data.isPublic) : (status === "published");
      return {
        id: docSnap.id,
        title: data.title || "",
        subtitle: data.subtitle || "",
        markdownContent: data.markdownContent || "",
        seoDescription: data.seoDescription || "",
        coverImageUrl: data.coverImageUrl || "",
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
        authorName: data.authorName || "Wanderlust 에디터",
        status,
        isPublic,
      } as BlogPost;
    }
  } catch (error) {
    console.error(`Error fetching blog ${id} from travel_blog_posts on server:`, error);
  }

  // Fallback to sample articles
  const sample = WEBZINE_SAMPLE_ARTICLES.find((a) => a.id === id);
  if (sample) {
    return sample as BlogPost;
  }

  return null;
}

/**
 * Fetch all public, published, and non-future blog posts for the Sitemap.
 */
export async function getAllPublicBlogPosts(): Promise<BlogPost[]> {
  const postsMap = new Map<string, BlogPost>();

  try {
    const travelRef = collection(db, "travel_blog_posts");
    const querySnapshot = await getDocs(travelRef);
    const now = new Date();

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const status = data.status || "published";
      const isPublic = data.isPublic !== undefined ? Boolean(data.isPublic) : (status === "published");
      
      const createdAt = data.createdAt || "";
      const createdDate = new Date(createdAt);

      // Enforce: actual post, public, published, and not scheduled in the future
      if (status === "published" && isPublic && createdDate <= now) {
        postsMap.set(docSnap.id, {
          id: docSnap.id,
          title: data.title || "",
          subtitle: data.subtitle || "",
          markdownContent: data.markdownContent || "",
          seoDescription: data.seoDescription || "",
          coverImageUrl: data.coverImageUrl || "",
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
          authorName: data.authorName || "Wanderlust 에디터",
          status,
          isPublic,
        });
      }
    });
  } catch (error) {
    console.error("Error fetching all public blogs for sitemap:", error);
  }

  // JavaScript-side sorting for zero-index query reliability
  const sortedPosts = Array.from(postsMap.values());
  sortedPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return sortedPosts;
}
