import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  setDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  where,
  Timestamp,
  getDocFromServer,
} from "firebase/firestore";
import { BlogPost, UserProfile } from "../types";

import firebaseConfig from "../../firebase-applet-config.json";

const app = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Test Firestore Connection
export async function checkFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
    return true;
  } catch (error: any) {
    console.warn("Firestore connectivity check note:", error?.message);
    return false;
  }
}

// Auth Helper
export const googleProvider = new GoogleAuthProvider();

export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Firebase Google Auth error:", error);
    throw error;
  }
}

export async function logoutUser() {
  await signOut(auth);
}

// Database helper: Local Storage Fallback Key
const LOCAL_STORAGE_POSTS_KEY = "wanderlust_travel_posts_db";

export function getLocalPosts(): BlogPost[] {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_POSTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

export function saveLocalPost(post: BlogPost) {
  const posts = getLocalPosts();
  const existingIndex = posts.findIndex((p) => p.id === post.id);
  if (existingIndex >= 0) {
    posts[existingIndex] = post;
  } else {
    posts.unshift(post);
  }
  localStorage.setItem(LOCAL_STORAGE_POSTS_KEY, JSON.stringify(posts));
}

export function deleteLocalPost(id: string) {
  const posts = getLocalPosts().filter((p) => p.id !== id);
  localStorage.setItem(LOCAL_STORAGE_POSTS_KEY, JSON.stringify(posts));
}

// Database Firestore Operations (with smooth local storage synchronization)
export async function savePostToFirestore(post: Omit<BlogPost, "id"> & { id?: string }): Promise<string> {
  const isExisting = Boolean(post.id);
  const targetId = post.id || `post_${Date.now()}`;
  const fullPost: BlogPost = {
    ...post,
    id: targetId,
    createdAt: post.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Always sync to Local Storage for offline/instant UI feedback
  saveLocalPost(fullPost);

  try {
    if (isExisting && post.id) {
      const docRef = doc(db, "travel_blog_posts", post.id);
      await setDoc(
        docRef,
        {
          ...fullPost,
          updatedAtServer: Timestamp.now(),
        },
        { merge: true }
      );
      console.log("Updated post in Firestore with ID:", post.id);
      return post.id;
    } else {
      const postsRef = collection(db, "travel_blog_posts");
      const docRef = await addDoc(postsRef, {
        ...fullPost,
        createdAtServer: Timestamp.now(),
      });
      console.log("Saved new post to Firestore with ID:", docRef.id);
      return docRef.id;
    }
  } catch (error) {
    console.warn("Firestore save fallback to Local Storage:", error);
    return targetId;
  }
}

export async function fetchPostsFromFirestore(): Promise<BlogPost[]> {
  try {
    const postsRef = collection(db, "travel_blog_posts");
    const q = query(postsRef, orderBy("createdAtServer", "desc"));
    const querySnapshot = await getDocs(q);
    const firestorePosts: BlogPost[] = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      firestorePosts.push({
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
        metaKeywords: data.metaKeywords || [],
        hashtags: data.hashtags || [],
        itinerary: data.itinerary || [],
        markdownContent: data.markdownContent || "",
        travelTips: data.travelTips || [],
        seoDescription: data.seoDescription || "",
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
        views: data.views || 0,
        likes: data.likes || 0,
        status: data.status || "published",
        coverImageUrl: data.coverImageUrl,
      });
    });

    if (firestorePosts.length > 0) {
      return firestorePosts;
    }
  } catch (error) {
    console.warn("Fetching from Firestore failed, using local storage:", error);
  }

  return getLocalPosts();
}

export async function deletePostFromFirestore(postId: string): Promise<void> {
  deleteLocalPost(postId);
  try {
    const docRef = doc(db, "travel_blog_posts", postId);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn("Firestore delete fallback:", error);
  }
}
