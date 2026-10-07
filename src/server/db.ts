import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, getDoc, collection, getDocs, query, orderBy } from "firebase/firestore";
import fs from "fs";
import path from "path";
import { WEBZINE_SAMPLE_ARTICLES } from "../data/webzineSampleArticles.js";

// Load config
const configPath = path.resolve(process.cwd(), "firebase-applet-config.json");
const firebaseConfigJson = JSON.parse(fs.readFileSync(configPath, "utf-8"));

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
  firestoreDatabaseId: firebaseConfigJson.firestoreDatabaseId || "(default)",
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
    const docRef = doc(db, "blogs", id);
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
    console.error(`Error fetching blog ${id} from Firestore on server:`, error);
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
    const q = query(collection(db, "blogs"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
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

  // Merge sample articles (taking precedence if not overwritten by Firestore)
  for (const sample of WEBZINE_SAMPLE_ARTICLES) {
    if (!postsMap.has(sample.id)) {
      postsMap.set(sample.id, sample as BlogPost);
    }
  }

  return Array.from(postsMap.values());
}
