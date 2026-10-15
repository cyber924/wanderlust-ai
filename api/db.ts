import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, getDoc, collection, getDocs } from "firebase/firestore";
import fs from "fs";
import path from "path";
import { WEBZINE_SAMPLE_ARTICLES } from "./webzineSampleArticles.js";
import { BlogPost } from "../src/types.js";

// Load config
const configPath = path.resolve(process.cwd(), "firebase-applet-config.json");
let firebaseConfigJson: any = {};
try {
  if (fs.existsSync(configPath)) {
    firebaseConfigJson = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  }
} catch (e) {
  console.warn("Could not read firebase-applet-config.json:", e);
}

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || firebaseConfigJson.apiKey || "",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigJson.authDomain || "",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || firebaseConfigJson.projectId || "",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigJson.storageBucket || "",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigJson.messagingSenderId || "",
  appId: process.env.VITE_FIREBASE_APP_ID || firebaseConfigJson.appId || "",
  firestoreDatabaseId: process.env.VITE_FIREBASE_DATABASE_ID || firebaseConfigJson.firestoreDatabaseId || "(default)",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export type { BlogPost };

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
        destination: data.destination || "",
        duration: data.duration || "",
        concept: data.concept || "",
        tone: data.tone || "",
        targetAudience: data.targetAudience || "",
        budget: data.budget || "",
        season: data.season || "",
        categoryType: data.categoryType || "travel",
        categoryName: data.categoryName || "",
        metaKeywords: data.metaKeywords || [],
        hashtags: data.hashtags || [],
        coverImageUrl: data.coverImageUrl || "",
        itinerary: data.itinerary || [],
        markdownContent: data.markdownContent || "",
        travelTips: data.travelTips || [],
        seoDescription: data.seoDescription || "",
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
        authorName: data.authorName || "Wanderlust 에디터",
        views: data.views || 0,
        likes: data.likes || 0,
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

      if (status === "published" && isPublic && (isNaN(createdDate.getTime()) || createdDate <= now)) {
        postsMap.set(docSnap.id, {
          id: docSnap.id,
          title: data.title || "",
          subtitle: data.subtitle || "",
          destination: data.destination || "",
          duration: data.duration || "",
          concept: data.concept || "",
          tone: data.tone || "",
          targetAudience: data.targetAudience || "",
          budget: data.budget || "",
          season: data.season || "",
          categoryType: data.categoryType || "travel",
          categoryName: data.categoryName || "",
          metaKeywords: data.metaKeywords || [],
          hashtags: data.hashtags || [],
          coverImageUrl: data.coverImageUrl || "",
          itinerary: data.itinerary || [],
          markdownContent: data.markdownContent || "",
          travelTips: data.travelTips || [],
          seoDescription: data.seoDescription || "",
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
          authorName: data.authorName || "Wanderlust 에디터",
          views: data.views || 0,
          likes: data.likes || 0,
          status,
          isPublic,
        });
      }
    });
  } catch (error) {
    console.error("Error fetching all public blogs for sitemap:", error);
  }

  const sortedPosts = Array.from(postsMap.values());
  sortedPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return sortedPosts;
}
