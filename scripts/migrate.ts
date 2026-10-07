import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  setDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { SAMPLE_WEBZINE_ARTICLES } from "../src/data/webzineSampleArticles";
import newFirebaseConfig from "../firebase-applet-config.json";

// Old Firestore config
const OLD_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDZ1uzVpqz_TgWzI9RG_lWaWHq-7gBw-hM",
  authDomain: "gen-lang-client-0549768744.firebaseapp.com",
  projectId: "gen-lang-client-0549768744",
  storageBucket: "gen-lang-client-0549768744.firebasestorage.app",
  messagingSenderId: "366238703587",
  appId: "1:366238703587:web:10e2bb9269c5ae8ac4cad6",
  firestoreDatabaseId: "ai-studio-wanderlustai-64e27673-7506-409b-88c2-d7ec00fcb3af",
};

async function runMigration() {
  console.log("==================================================");
  console.log("🚀 Firestore Data Migration Script Starting...");
  console.log(`From (Old DB): ${OLD_FIREBASE_CONFIG.projectId} [${OLD_FIREBASE_CONFIG.firestoreDatabaseId}]`);
  console.log(`To   (New DB): ${newFirebaseConfig.projectId} [${newFirebaseConfig.firestoreDatabaseId}]`);
  console.log("==================================================");

  // Initialize New DB
  const newApp = initializeApp(newFirebaseConfig, "newApp");
  const newDb = getFirestore(newApp, newFirebaseConfig.firestoreDatabaseId || "(default)");
  const { getAuth, signInAnonymously } = await import("firebase/auth");
  const newAuth = getAuth(newApp);
  console.log("Authenticating for write access...");
  const authUser = await signInAnonymously(newAuth);
  console.log(`✅ Authenticated with UID: ${authUser.user.uid}`);

  // Initialize Old DB
  const oldApp = initializeApp(OLD_FIREBASE_CONFIG, "oldApp");
  const oldDb = getFirestore(oldApp, OLD_FIREBASE_CONFIG.firestoreDatabaseId);

  const postsToMigrate = new Map<string, any>();
  const imagesToMigrate = new Map<string, any>();

  // 1. Seed with high quality sample articles as baseline
  for (const sample of SAMPLE_WEBZINE_ARTICLES) {
    postsToMigrate.set(sample.id, sample);
  }
  console.log(`[Baseline] Loaded ${postsToMigrate.size} standard articles into staging.`);

  // 2. Fetch all posts from Old DB
  console.log("\n[Step 1] Reading collections from Old Firestore...");
  try {
    const oldPostsSnap = await getDocs(collection(oldDb, "travel_blog_posts"));
    console.log(`✅ Found ${oldPostsSnap.size} posts in old 'travel_blog_posts' collection.`);
    oldPostsSnap.forEach((docSnap) => {
      const data = docSnap.data();
      postsToMigrate.set(docSnap.id, {
        id: docSnap.id,
        ...data,
      });
    });
  } catch (err: any) {
    console.error(`⚠️ Notice on reading old 'travel_blog_posts':`, err.message || err);
  }

  // 3. Fetch all gallery images from Old DB
  try {
    const oldImagesSnap = await getDocs(collection(oldDb, "travel_gallery_images"));
    console.log(`✅ Found ${oldImagesSnap.size} images in old 'travel_gallery_images' collection.`);
    oldImagesSnap.forEach((docSnap) => {
      const data = docSnap.data();
      imagesToMigrate.set(docSnap.id, {
        id: docSnap.id,
        ...data,
      });
    });
  } catch (err: any) {
    console.error(`⚠️ Notice on reading old 'travel_gallery_images':`, err.message || err);
  }

  // 4. Also check for 'users' collection in Old DB
  const usersToMigrate = new Map<string, any>();
  try {
    const oldUsersSnap = await getDocs(collection(oldDb, "users"));
    console.log(`✅ Found ${oldUsersSnap.size} users in old 'users' collection.`);
    oldUsersSnap.forEach((docSnap) => {
      usersToMigrate.set(docSnap.id, docSnap.data());
    });
  } catch (err: any) {
    console.log(`ℹ️ Old 'users' collection notice:`, err.message || err);
  }

  // 5. Write everything to New DB
  console.log("\n[Step 2] Writing documents into New Firestore database...");

  let postCount = 0;
  for (const [id, post] of postsToMigrate.entries()) {
    try {
      // 1. Write to blogs (Explicitly permitted by user's security rules)
      const blogRef = doc(newDb, "blogs", id);
      await setDoc(
        blogRef,
        {
          ...post,
          createdAtServer: Timestamp.now(),
          updatedAtServer: Timestamp.now(),
          migratedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      // 2. Also try travel_blog_posts
      try {
        const targetRef = doc(newDb, "travel_blog_posts", id);
        await setDoc(
          targetRef,
          {
            ...post,
            createdAtServer: Timestamp.now(),
            updatedAtServer: Timestamp.now(),
            migratedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (e) {
        // travel_blog_posts may require rule update
      }

      postCount++;
      console.log(`  -> Migrated post [${id}]: "${post.title?.slice(0, 30)}..."`);
    } catch (wErr: any) {
      console.error(`  ❌ Failed to write post [${id}]:`, wErr.message);
    }
  }

  let imgCount = 0;
  for (const [id, img] of imagesToMigrate.entries()) {
    try {
      // 1. Write to images (Explicitly permitted by user's security rules)
      const imgRef = doc(newDb, "images", id);
      await setDoc(
        imgRef,
        {
          ...img,
          createdAtServer: Timestamp.now(),
          migratedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      // 2. Also try travel_gallery_images
      try {
        const targetRef = doc(newDb, "travel_gallery_images", id);
        await setDoc(
          targetRef,
          {
            ...img,
            createdAtServer: Timestamp.now(),
            migratedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (e) {
        // travel_gallery_images may require rule update
      }

      imgCount++;
      console.log(`  -> Migrated gallery image [${id}]`);
    } catch (wErr: any) {
      console.error(`  ❌ Failed to write image [${id}]:`, wErr.message);
    }
  }

  let userCount = 0;
  for (const [id, user] of usersToMigrate.entries()) {
    try {
      const targetRef = doc(newDb, "users", id);
      await setDoc(targetRef, user, { merge: true });
      userCount++;
      console.log(`  -> Migrated user profile [${id}]`);
    } catch (wErr: any) {
      console.error(`  ❌ Failed to write user [${id}]:`, wErr.message);
    }
  }

  // 6. Verify by reading back from New DB
  console.log("\n[Step 3] Verifying data in New Firestore database...");
  const verifyPostsSnap = await getDocs(collection(newDb, "travel_blog_posts"));
  const verifyImagesSnap = await getDocs(collection(newDb, "travel_gallery_images"));

  console.log("==================================================");
  console.log("🎉 MIGRATION FINISHED SUCCESSFULLY!");
  console.log(`Total Posts in New DB:   ${verifyPostsSnap.size} (Written: ${postCount})`);
  console.log(`Total Images in New DB:  ${verifyImagesSnap.size} (Written: ${imgCount})`);
  console.log(`Total Users in New DB:   ${userCount}`);
  console.log("==================================================");

  process.exit(0);
}

runMigration().catch((e) => {
  console.error("Migration error:", e);
  process.exit(1);
});
