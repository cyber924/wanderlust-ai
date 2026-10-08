import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signInAnonymously,
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
  limit,
  Timestamp,
  getDocFromServer,
} from "firebase/firestore";
import { BlogPost, GeneratedImage, UserProfile, ScheduledTask } from "../types";
import { SAMPLE_WEBZINE_ARTICLES } from "../data/webzineSampleArticles";
import firebaseConfigJson from "../../firebase-applet-config.json";

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfigJson.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigJson.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfigJson.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigJson.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigJson.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfigJson.appId,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || firebaseConfigJson.firestoreDatabaseId || "(default)",
};

const app = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Ensure authentication for rule compliance (works for anonymous or logged-in users)
export async function ensureAuth(): Promise<User | null> {
  if (auth.currentUser) return auth.currentUser;
  try {
    const cred = await signInAnonymously(auth);
    return cred.user;
  } catch (error) {
    console.warn("Firebase anonymous authentication note:", error);
    return null;
  }
}

// Auto-authenticate in background on initial load
if (typeof window !== "undefined") {
  ensureAuth();
}

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

export async function signUpWithEmail(email: string, pass: string, displayName?: string) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (displayName && cred.user) {
      await updateProfile(cred.user, { displayName });
    }
    return cred.user;
  } catch (error) {
    console.error("Firebase Email SignUp error:", error);
    throw error;
  }
}

export async function loginWithEmail(email: string, pass: string) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    return cred.user;
  } catch (error) {
    console.error("Firebase Email Login error:", error);
    throw error;
  }
}

export async function logoutUser() {
  await signOut(auth);
}

// Database helper: Local Storage Fallback Keys
const LOCAL_STORAGE_POSTS_KEY = "wanderlust_travel_posts_db";
const LOCAL_STORAGE_IMAGES_KEY = "wanderlust_travel_gallery_images_db";

export function getLocalPosts(): BlogPost[] {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_POSTS_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    // ignore
  }
  return SAMPLE_WEBZINE_ARTICLES;
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

// Local Storage operations for Images
export function getLocalImages(): GeneratedImage[] {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_IMAGES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

export function saveLocalImage(image: GeneratedImage) {
  const images = getLocalImages();
  const existingIndex = images.findIndex((img) => img.id === image.id);
  if (existingIndex >= 0) {
    images[existingIndex] = image;
  } else {
    images.unshift(image);
  }
  localStorage.setItem(LOCAL_STORAGE_IMAGES_KEY, JSON.stringify(images));
}

export function deleteLocalImage(id: string) {
  const images = getLocalImages().filter((img) => img.id !== id);
  localStorage.setItem(LOCAL_STORAGE_IMAGES_KEY, JSON.stringify(images));
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
    await ensureAuth();

    // 1. Save to blogs collection (matches user's Firestore Security Rules)
    const blogDocRef = doc(db, "blogs", targetId);
    await setDoc(
      blogDocRef,
      {
        ...fullPost,
        updatedAtServer: Timestamp.now(),
        createdAtServer: Timestamp.now(),
      },
      { merge: true }
    );

    // 2. Also save to travel_blog_posts collection for backward compatibility
    try {
      const travelDocRef = doc(db, "travel_blog_posts", targetId);
      await setDoc(
        travelDocRef,
        {
          ...fullPost,
          updatedAtServer: Timestamp.now(),
          createdAtServer: Timestamp.now(),
        },
        { merge: true }
      );
    } catch (tErr) {
      // Ignored if travel_blog_posts has separate restrictions
    }

    console.log("Saved post to Firestore with ID:", targetId);
    return targetId;
  } catch (error) {
    console.error("Critical Firestore write failure:", error);
    throw error;
  }
}

export async function fetchPostsFromFirestore(): Promise<BlogPost[]> {
  const postsMap = new Map<string, BlogPost>();

  // 1. Fetch from 'blogs' (Matches user's current security rules)
  try {
    const blogsRef = collection(db, "blogs");
    const querySnapshot = await getDocs(blogsRef);
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
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
        isPublic: data.isPublic !== undefined ? Boolean(data.isPublic) : (data.status === "published" || !data.status),
        authorName: data.authorName || "Wanderlust 에디터",
        categoryType: data.categoryType || "travel",
        coverImageUrl: data.coverImageUrl,
        isReserved: data.isReserved,
        scheduledAt: data.scheduledAt,
        recurrence: data.recurrence,
      });
    });
  } catch (err) {
    console.warn("Notice reading 'blogs' collection:", err);
  }

  // 2. Also fetch from 'travel_blog_posts' to merge any existing records
  try {
    const travelRef = collection(db, "travel_blog_posts");
    const querySnapshot2 = await getDocs(travelRef);
    querySnapshot2.forEach((docSnap) => {
      if (!postsMap.has(docSnap.id)) {
        const data = docSnap.data();
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
          isPublic: data.isPublic !== undefined ? Boolean(data.isPublic) : (data.status === "published" || !data.status),
          authorName: data.authorName || "Wanderlust 에디터",
          categoryType: data.categoryType || "travel",
          coverImageUrl: data.coverImageUrl,
          isReserved: data.isReserved,
          scheduledAt: data.scheduledAt,
          recurrence: data.recurrence,
        });
      }
    });
  } catch (err) {
    console.warn("Notice reading 'travel_blog_posts' collection:", err);
  }

  const firestorePosts = Array.from(postsMap.values());
  const localPosts = getLocalPosts();
  
  // Merge: Keep all local posts and override/supplement with Firestore posts
  const mergedMap = new Map<string, BlogPost>();
  localPosts.forEach((p) => {
    // Exclude static sample templates from polluting the custom database
    if (!p.id.startsWith("webzine_")) {
      mergedMap.set(p.id, p);
    }
  });
  firestorePosts.forEach((p) => {
    mergedMap.set(p.id, p);
  });
  
  const finalPosts = Array.from(mergedMap.values());
  localStorage.setItem(LOCAL_STORAGE_POSTS_KEY, JSON.stringify(finalPosts));

  // Sync any local posts that are NOT in Firestore yet back to Firestore to ensure absolute reliability!
  const unsyncedPosts = localPosts.filter(lp => !lp.id.startsWith("webzine_") && !postsMap.has(lp.id));
  if (unsyncedPosts.length > 0) {
    console.log(`[Sync] Automatically writing ${unsyncedPosts.length} unsynced local posts to Firestore...`);
    // Run in background asynchronously to prevent blocking the initial page load
    Promise.resolve().then(async () => {
      for (const p of unsyncedPosts) {
        try {
          await savePostToFirestore(p);
        } catch (err) {
          console.warn(`[Sync] Failed to sync post ${p.id} to Firestore:`, err);
        }
      }
    });
  }

  return finalPosts;
}

export async function deletePostFromFirestore(postId: string): Promise<void> {
  deleteLocalPost(postId);
  try {
    await ensureAuth();
    await Promise.allSettled([
      deleteDoc(doc(db, "blogs", postId)),
      deleteDoc(doc(db, "travel_blog_posts", postId)),
    ]);
  } catch (error) {
    console.warn("Firestore delete fallback:", error);
  }
}

// ----------------------------------------------------
// AI Gallery Images Firestore Operations
// ----------------------------------------------------

export async function saveImageToFirestore(image: GeneratedImage): Promise<string> {
  const targetId = image.id || `img_${Date.now()}`;
  const fullImage: GeneratedImage = {
    ...image,
    id: targetId,
    createdAt: image.createdAt || new Date().toISOString(),
  };

  saveLocalImage(fullImage);

  try {
    await ensureAuth();
    // 1. Save to 'images' collection (Matches user's current security rules)
    const imgDocRef = doc(db, "images", targetId);
    await setDoc(
      imgDocRef,
      {
        ...fullImage,
        createdAtServer: Timestamp.now(),
      },
      { merge: true }
    );

    // 2. Also save to travel_gallery_images for backward compatibility
    try {
      const travelDocRef = doc(db, "travel_gallery_images", targetId);
      await setDoc(
        travelDocRef,
        {
          ...fullImage,
          createdAtServer: Timestamp.now(),
        },
        { merge: true }
      );
    } catch (e) {}

    console.log("Saved AI image to Firestore with ID:", targetId);
    return targetId;
  } catch (error) {
    console.warn("Firestore save image fallback to Local Storage:", error);
    return targetId;
  }
}

export async function saveMultipleImagesToFirestore(images: GeneratedImage[]): Promise<void> {
  for (const img of images) {
    await saveImageToFirestore(img);
  }
}

export async function fetchImagesFromFirestore(): Promise<GeneratedImage[]> {
  const imagesMap = new Map<string, GeneratedImage>();

  // 1. Fetch from 'images' collection
  try {
    const imagesRef = collection(db, "images");
    const querySnapshot = await getDocs(imagesRef);
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      imagesMap.set(docSnap.id, {
        id: docSnap.id,
        imageUrl: data.imageUrl || "",
        destination: data.destination || "",
        style: data.style || "",
        lighting: data.lighting || "",
        aspectRatio: data.aspectRatio || "16:9",
        prompt: data.prompt || "",
        createdAt: data.createdAt || new Date().toISOString(),
        linkedBlogId: data.linkedBlogId,
        linkedBlogTitle: data.linkedBlogTitle,
        isCover: data.isCover,
      });
    });
  } catch (err) {
    console.warn("Notice reading 'images' collection:", err);
  }

  // 2. Also fetch from 'travel_gallery_images'
  try {
    const travelImgRef = collection(db, "travel_gallery_images");
    const querySnapshot2 = await getDocs(travelImgRef);
    querySnapshot2.forEach((docSnap) => {
      if (!imagesMap.has(docSnap.id)) {
        const data = docSnap.data();
        imagesMap.set(docSnap.id, {
          id: docSnap.id,
          imageUrl: data.imageUrl || "",
          destination: data.destination || "",
          style: data.style || "",
          lighting: data.lighting || "",
          aspectRatio: data.aspectRatio || "16:9",
          prompt: data.prompt || "",
          createdAt: data.createdAt || new Date().toISOString(),
          linkedBlogId: data.linkedBlogId,
          linkedBlogTitle: data.linkedBlogTitle,
          isCover: data.isCover,
        });
      }
    });
  } catch (err) {
    console.warn("Notice reading 'travel_gallery_images' collection:", err);
  }

  const firestoreImages = Array.from(imagesMap.values());
  const localImages = getLocalImages();

  const mergedImgMap = new Map<string, GeneratedImage>();
  localImages.forEach((img) => mergedImgMap.set(img.id, img));
  firestoreImages.forEach((img) => mergedImgMap.set(img.id, img));

  const finalImages = Array.from(mergedImgMap.values());
  localStorage.setItem(LOCAL_STORAGE_IMAGES_KEY, JSON.stringify(finalImages));

  // Sync any local images that are not in Firestore yet to Firestore in the background
  const unsyncedImages = localImages.filter(li => !imagesMap.has(li.id));
  if (unsyncedImages.length > 0) {
    console.log(`[Sync] Automatically writing ${unsyncedImages.length} unsynced local images to Firestore...`);
    Promise.resolve().then(async () => {
      for (const img of unsyncedImages) {
        try {
          await saveImageToFirestore(img);
        } catch (err) {
          console.warn(`[Sync] Failed to sync image ${img.id} to Firestore:`, err);
        }
      }
    });
  }

  return finalImages;
}

export async function deleteImageFromFirestore(imageId: string): Promise<void> {
  deleteLocalImage(imageId);
  try {
    await ensureAuth();
    await Promise.allSettled([
      deleteDoc(doc(db, "images", imageId)),
      deleteDoc(doc(db, "travel_gallery_images", imageId)),
    ]);
  } catch (error) {
    console.warn("Firestore delete image fallback:", error);
  }
}

export async function clearAllImagesFromFirestore(): Promise<void> {
  localStorage.removeItem(LOCAL_STORAGE_IMAGES_KEY);
  try {
    await ensureAuth();
    const [imagesSnap, travelSnap] = await Promise.allSettled([
      getDocs(collection(db, "images")),
      getDocs(collection(db, "travel_gallery_images")),
    ]);

    const docsToDelete: any[] = [];
    if (imagesSnap.status === "fulfilled") docsToDelete.push(...imagesSnap.value.docs);
    if (travelSnap.status === "fulfilled") docsToDelete.push(...travelSnap.value.docs);

    await Promise.all(docsToDelete.map((d) => deleteDoc(d.ref)));
  } catch (error) {
    console.warn("Firestore clearAllImages fallback:", error);
  }
}

export async function linkImageToBlogInFirestore(
  imageId: string,
  blogId: string,
  blogTitle: string,
  isCover: boolean = false
): Promise<void> {
  const localImages = getLocalImages();
  const found = localImages.find((img) => img.id === imageId);
  if (found) {
    found.linkedBlogId = blogId;
    found.linkedBlogTitle = blogTitle;
    found.isCover = isCover;
    saveLocalImage(found);
  }

  try {
    await ensureAuth();
    await Promise.allSettled([
      setDoc(
        doc(db, "images", imageId),
        { linkedBlogId: blogId, linkedBlogTitle: blogTitle, isCover, updatedAtServer: Timestamp.now() },
        { merge: true }
      ),
      setDoc(
        doc(db, "travel_gallery_images", imageId),
        { linkedBlogId: blogId, linkedBlogTitle: blogTitle, isCover, updatedAtServer: Timestamp.now() },
        { merge: true }
      ),
    ]);
  } catch (error) {
    console.warn("Firestore linkImage fallback:", error);
  }
}

// ----------------------------------------------------
// Scheduled Queue (Cron Autopilot) Operations
// ----------------------------------------------------

export async function saveScheduledTaskToFirestore(task: ScheduledTask): Promise<void> {
  try {
    await ensureAuth();
    const docRef = doc(db, "scheduled_queue", task.id);
    await setDoc(docRef, {
      ...task,
      updatedAtServer: Timestamp.now(),
    }, { merge: true });
    console.log("Saved scheduled task to Firestore:", task.id);
  } catch (error) {
    console.error("Error saving scheduled task:", error);
    throw error;
  }
}

export async function fetchScheduledTasksFromFirestore(): Promise<ScheduledTask[]> {
  const tasks: ScheduledTask[] = [];
  try {
    const queueRef = collection(db, "scheduled_queue");
    const q = query(queueRef, orderBy("scheduledAt", "asc"));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      tasks.push({
        id: docSnap.id,
        categoryType: data.categoryType || "travel",
        topicKeywords: data.topicKeywords || [],
        scheduledAt: data.scheduledAt || new Date().toISOString(),
        recurrence: data.recurrence || "none",
        persona: data.persona || "default",
        status: data.status || "pending",
        lastExecutedPostId: data.lastExecutedPostId,
        createdAt: data.createdAt || new Date().toISOString(),
      });
    });
  } catch (err) {
    console.warn("Notice reading 'scheduled_queue' collection:", err);
  }
  return tasks;
}

export async function deleteScheduledTaskFromFirestore(taskId: string): Promise<void> {
  try {
    await ensureAuth();
    await deleteDoc(doc(db, "scheduled_queue", taskId));
    console.log("Deleted scheduled task from Firestore:", taskId);
  } catch (error) {
    console.error("Error deleting scheduled task:", error);
    throw error;
  }
}

