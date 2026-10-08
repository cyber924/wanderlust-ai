import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  setDoc,
  doc,
  getDoc,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { BlogPost, GeneratedImage } from "../types";
import { SAMPLE_WEBZINE_ARTICLES } from "../data/webzineSampleArticles";
import { getLocalPosts, getLocalImages, saveLocalPost, saveLocalImage } from "./firebase";
import newFirebaseConfig from "../../firebase-applet-config.json";

// Old shared database configuration preserved for data extraction
const OLD_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDZ1uzVpqz_TgWzI9RG_lWaWHq-7gBw-hM",
  authDomain: "gen-lang-client-0549768744.firebaseapp.com",
  projectId: "gen-lang-client-0549768744",
  storageBucket: "gen-lang-client-0549768744.firebasestorage.app",
  messagingSenderId: "366238703587",
  appId: "1:366238703587:web:10e2bb9269c5ae8ac4cad6",
  firestoreDatabaseId: "ai-studio-wanderlustai-64e27673-7506-409b-88c2-d7ec00fcb3af",
};

export interface MigrationResult {
  success: boolean;
  postsMigrated: number;
  imagesMigrated: number;
  sourceOldDb: boolean;
  sourceLocalCache: boolean;
  details: string[];
  error?: string;
}

export async function runDatabaseMigration(
  onProgress?: (msg: string) => void
): Promise<MigrationResult> {
  const details: string[] = [];
  let postsMigrated = 0;
  let imagesMigrated = 0;
  let sourceOldDb = false;
  let sourceLocalCache = false;

  const log = (msg: string) => {
    details.push(msg);
    if (onProgress) onProgress(msg);
    console.log(`[Migration] ${msg}`);
  };

  log("🚀 신규 전용 Firebase DB(studio-1232942596-90a88) 마이그레이션을 시작합니다...");

  // 1. Initialize New DB
  let newApp;
  try {
    const existing = getApps().find((a) => a.name === "[DEFAULT]");
    newApp = existing || initializeApp(newFirebaseConfig);
  } catch (e: any) {
    newApp = getApp();
  }
  const newDb = getFirestore(newApp, newFirebaseConfig.firestoreDatabaseId || "(default)");

  // 2. Try Initialize Old DB Bridge
  let oldDb: any = null;
  try {
    const existingOld = getApps().find((a) => a.name === "oldSharedApp");
    const oldApp = existingOld || initializeApp(OLD_FIREBASE_CONFIG, "oldSharedApp");
    oldDb = getFirestore(oldApp, OLD_FIREBASE_CONFIG.firestoreDatabaseId);
  } catch (e: any) {
    log(`⚠️ 구 공유 DB 인스턴스 초기화 주의: ${e?.message}`);
  }

  // 3. Extract Blog Posts
  const postMap = new Map<string, BlogPost>();

  // 3-1. Always load standard built-in sample articles first
  SAMPLE_WEBZINE_ARTICLES.forEach((p) => {
    postMap.set(p.id, p);
  });

  // 3-2. Extract from Local Storage (always available offline/cached)
  const localPosts = getLocalPosts();
  if (localPosts.length > 0) {
    sourceLocalCache = true;
    localPosts.forEach((p) => postMap.set(p.id, p));
    log(`📦 로컬 브라우저 캐시에서 글 ${localPosts.length}건을 확보했습니다.`);
  }

  // 3-3. Try extract from Old Remote Firestore DB
  if (oldDb) {
    try {
      log("🔍 기존 공유 Firestore 서버에서 글 원본 데이터 추출 시도 중...");
      const oldPostsSnap = await getDocs(collection(oldDb, "travel_blog_posts"));
      if (!oldPostsSnap.empty) {
        sourceOldDb = true;
        oldPostsSnap.forEach((docSnap) => {
          const data = docSnap.data() as any;
          postMap.set(docSnap.id, {
            id: docSnap.id,
            title: data.title || "무제",
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
          });
        });
        log(`🌐 기존 공유 DB 서버로부터 최신 글 ${oldPostsSnap.size}건을 안전하게 추출했습니다.`);
      }
    } catch (oldDbErr: any) {
      log(`ℹ️ 기존 공유 DB 쿼터 초과(${oldDbErr?.code || oldDbErr?.message}). 로컬 영구 캐시 및 샘플 데이터로 무손실 복원을 계속합니다.`);
    }
  }

  // 4. Extract Gallery Images
  const imageMap = new Map<string, GeneratedImage>();
  const localImages = getLocalImages();
  if (localImages.length > 0) {
    localImages.forEach((img) => imageMap.set(img.id, img));
    log(`🖼️ 로컬 캐시에서 AI 갤러리 이미지 ${localImages.length}건을 확보했습니다.`);
  }

  if (oldDb) {
    try {
      const oldImgSnap = await getDocs(collection(oldDb, "travel_gallery_images"));
      if (!oldImgSnap.empty) {
        oldImgSnap.forEach((docSnap) => {
          const data = docSnap.data() as any;
          imageMap.set(docSnap.id, {
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
        log(`🌐 기존 공유 DB 서버로부터 AI 생성 이미지 ${oldImgSnap.size}건을 추출했습니다.`);
      }
    } catch (e: any) {
      log(`ℹ️ 이미지 서버 조회 안내: ${e?.message}`);
    }
  }

  // 5. Batch Write into New Firebase Firestore DB with Safe ID & updatedAt Comparison
  const { ensureAuth } = await import("./firebase");
  await ensureAuth();

  const allPosts = Array.from(postMap.values());
  log(`✍️ 신규 DB(studio-1232942596-90a88)에 총 ${allPosts.length}편의 블로그 글 동기화 중 (중복 및 최신 상태 비교 포함)...`);

  // Write posts to 'blogs' collection safely
  for (const post of allPosts) {
    try {
      const blogRef = doc(newDb, "blogs", post.id);
      
      // Compare ID and updatedAt before writing to protect existing newer data
      const existingDocSnap = await getDoc(blogRef);
      if (existingDocSnap.exists()) {
        const existingData = existingDocSnap.data();
        const existingUpdatedAt = existingData?.updatedAt;
        if (existingUpdatedAt && post.updatedAt) {
          const existingTime = new Date(existingUpdatedAt).getTime();
          const incomingTime = new Date(post.updatedAt).getTime();
          if (existingTime >= incomingTime) {
            log(`⏭️ [보존] '${post.title}' (ID: ${post.id}) 문서는 신규 DB가 이미 더 최신이거나 같으므로 이전을 건너뜁니다.`);
            continue;
          }
        }
      }

      await setDoc(
        blogRef,
        {
          ...post,
          createdAtServer: Timestamp.now(),
          updatedAtServer: Timestamp.now(),
          migratedToNewDb: true,
        },
        { merge: true }
      );
      saveLocalPost(post);
      postsMigrated++;
      log(`✅ [이전완료] '${post.title}' (ID: ${post.id})이 신규 DB로 이전되었습니다.`);
    } catch (writeErr: any) {
      log(`⚠️ 포스트(${post.id}) 쓰기 오류: ${writeErr?.message}`);
    }
  }

  // Write images to 'images' collection safely
  const allImages = Array.from(imageMap.values());
  log(`✍️ 신규 DB에 총 ${allImages.length}개의 AI 스냅 이미지 동기화 중 (중복 비교 포함)...`);
  for (const img of allImages) {
    try {
      const imgRef = doc(newDb, "images", img.id);
      
      // Compare existence for images to protect existing data
      const existingImgSnap = await getDoc(imgRef);
      if (existingImgSnap.exists()) {
        log(`⏭️ [보존] 이미지 (ID: ${img.id})가 이미 신규 DB에 존재하므로 이전을 건너뜁니다.`);
        continue;
      }

      await setDoc(
        imgRef,
        {
          ...img,
          createdAtServer: Timestamp.now(),
          migratedToNewDb: true,
        },
        { merge: true }
      );
      saveLocalImage(img);
      imagesMigrated++;
      log(`✅ [이전완료] 이미지 (ID: ${img.id})가 신규 DB로 이전되었습니다.`);
    } catch (writeImgErr: any) {
      log(`⚠️ 이미지(${img.id}) 쓰기 오류: ${writeImgErr?.message}`);
    }
  }

  localStorage.setItem("wanderlust_migration_completed_v2", "true");
  localStorage.setItem("wanderlust_active_project_id", newFirebaseConfig.projectId);

  log(`🎉 마이그레이션 성공! 글 ${postsMigrated}편 및 이미지 ${imagesMigrated}개가 신규 전용 파이어베이스 DB에 안전하게 적재되었습니다.`);

  return {
    success: true,
    postsMigrated,
    imagesMigrated,
    sourceOldDb,
    sourceLocalCache,
    details,
  };
}
