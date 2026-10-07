import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, Timestamp, collection, getDocs } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";
import newFirebaseConfig from "../firebase-applet-config.json";

interface GalleryImageItem {
  id: string;
  imageUrl: string;
  destination: string;
  style: string;
  lighting: string;
  aspectRatio: string;
  prompt: string;
  createdAt: string;
  linkedBlogId?: string;
  linkedBlogTitle?: string;
  isCover?: boolean;
}

const GALLERY_IMAGES: GalleryImageItem[] = [
  // --- 1. 파리 (Paris) ---
  {
    id: "img_paris_cover",
    imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1600&q=80",
    destination: "파리 에펠탑 & 센강",
    style: "감성 시네마틱",
    lighting: "골든아워 노을",
    aspectRatio: "16:9",
    prompt: "Paris Eiffel Tower sunset panoramic cinematic golden hour travel photography",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    linkedBlogId: "webzine_paris_01",
    linkedBlogTitle: "낭만의 도시 파리 3박 4일, 센강 야경과 숨은 골목 카페 완벽 정복",
    isCover: true,
  },
  {
    id: "img_paris_notredame",
    imageUrl: "https://images.unsplash.com/photo-1509299349698-dd22323b5963?auto=format&fit=crop&w=800&q=80",
    destination: "파리 노트르담 대성당 & 시테섬",
    style: "필름 아날로그",
    lighting: "자연광",
    aspectRatio: "16:9",
    prompt: "Notre Dame Cathedral Paris Ile de la Cite sunny afternoon travel snapshot",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    linkedBlogId: "webzine_paris_01",
    linkedBlogTitle: "낭만의 도시 파리 3박 4일, 센강 야경과 숨은 골목 카페 완벽 정복",
    isCover: false,
  },
  {
    id: "img_paris_berthillon",
    imageUrl: "https://images.unsplash.com/photo-1478358161113-b0e11994a36b?auto=format&fit=crop&w=800&q=80",
    destination: "파리 생루이섬 베르티용",
    style: "따뜻한 빈티지",
    lighting: "오후 역광",
    aspectRatio: "16:9",
    prompt: "Saint Louis island Paris historic quaint streets ice cream cafe vibe",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    linkedBlogId: "webzine_paris_01",
    linkedBlogTitle: "낭만의 도시 파리 3박 4일, 센강 야경과 숨은 골목 카페 완벽 정복",
    isCover: false,
  },
  {
    id: "img_paris_eiffel_champ",
    imageUrl: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=800&q=80",
    destination: "파리 에펠탑 & 샹드마르스 공원",
    style: "감성 시네마틱",
    lighting: "일몰 매직아워",
    aspectRatio: "16:9",
    prompt: "Champ de Mars Eiffel Tower twilight evening illuminated lights picnic",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    linkedBlogId: "webzine_paris_01",
    linkedBlogTitle: "낭만의 도시 파리 3박 4일, 센강 야경과 숨은 골목 카페 완벽 정복",
    isCover: false,
  },
  {
    id: "img_paris_louvre",
    imageUrl: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80",
    destination: "파리 루브르 박물관",
    style: "모던 미니멀",
    lighting: "야간 조명",
    aspectRatio: "16:9",
    prompt: "Louvre Museum glass pyramid night lights reflection Paris architectural masterpiece",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    linkedBlogId: "webzine_paris_01",
    linkedBlogTitle: "낭만의 도시 파리 3박 4일, 센강 야경과 숨은 골목 카페 완벽 정복",
    isCover: false,
  },
  {
    id: "img_paris_orsay",
    imageUrl: "https://images.unsplash.com/photo-1520939817895-060bdef4ad1b?auto=format&fit=crop&w=800&q=80",
    destination: "파리 오르세 미술관",
    style: "클래식 아트",
    lighting: "실내 자연광",
    aspectRatio: "16:9",
    prompt: "Musee d'Orsay Paris historic train station clock architecture impressionist art museum",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    linkedBlogId: "webzine_paris_01",
    linkedBlogTitle: "낭만의 도시 파리 3박 4일, 센강 야경과 숨은 골목 카페 완벽 정복",
    isCover: false,
  },
  {
    id: "img_paris_montmartre",
    imageUrl: "https://images.unsplash.com/photo-1543349689-9a4d426bee8e?auto=format&fit=crop&w=800&q=80",
    destination: "파리 몽마르트르 언덕 & 사크레쾨르",
    style: "로맨틱 감성",
    lighting: "황혼 노을",
    aspectRatio: "16:9",
    prompt: "Sacre Coeur Montmartre hilltop sunset overlooking Paris cobblestone alleys artists",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    linkedBlogId: "webzine_paris_01",
    linkedBlogTitle: "낭만의 도시 파리 3박 4일, 센강 야경과 숨은 골목 카페 완벽 정복",
    isCover: false,
  },
  {
    id: "img_paris_marais",
    imageUrl: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80",
    destination: "파리 마레 지구 & 보주 광장",
    style: "프렌치 시크",
    lighting: "맑은 오후 햇살",
    aspectRatio: "16:9",
    prompt: "Le Marais Paris Place des Vosges brick arches chic boutique streets outdoor cafe",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    linkedBlogId: "webzine_paris_01",
    linkedBlogTitle: "낭만의 도시 파리 3박 4일, 센강 야경과 숨은 골목 카페 완벽 정복",
    isCover: false,
  },
  {
    id: "img_paris_pompidou",
    imageUrl: "https://images.unsplash.com/photo-1444723121867-7a241cacace9?auto=format&fit=crop&w=800&q=80",
    destination: "파리 퐁피두 센터 전망대",
    style: "어반 컨템포러리",
    lighting: "선셋 골든아워",
    aspectRatio: "16:9",
    prompt: "Centre Pompidou Paris rooftop high view cityscape terracotta roofs",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    linkedBlogId: "webzine_paris_01",
    linkedBlogTitle: "낭만의 도시 파리 3박 4일, 센강 야경과 숨은 골목 카페 완벽 정복",
    isCover: false,
  },

  // --- 2. 도쿄 (Tokyo) ---
  {
    id: "img_tokyo_cover",
    imageUrl: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1600&q=80",
    destination: "도쿄 타워 & 도시 스카이라인",
    style: "사이버펑크 네온",
    lighting: "야간 네온",
    aspectRatio: "16:9",
    prompt: "Tokyo Tower night skyline glowing red cyberpunk urban landscape Japan",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    linkedBlogId: "webzine_tokyo_02",
    linkedBlogTitle: "도쿄 미식 & 골목 감성 3박 4일, 시부야부터 나카메구로까지",
    isCover: true,
  },
  {
    id: "img_tokyo_shibuya",
    imageUrl: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80",
    destination: "도쿄 시부야 스크램블 교차로",
    style: "어반 다이나믹",
    lighting: "화려한 전광판 불빛",
    aspectRatio: "16:9",
    prompt: "Shibuya crossing Tokyo bustling crowded street intersection neon billboards",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    linkedBlogId: "webzine_tokyo_02",
    linkedBlogTitle: "도쿄 미식 & 골목 감성 3박 4일, 시부야부터 나카메구로까지",
    isCover: false,
  },
  {
    id: "img_tokyo_shinjuku",
    imageUrl: "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=800&q=80",
    destination: "도쿄 신주쿠 오모이데요코초",
    style: "레트로 빈티지",
    lighting: "붉은 홍등 불빛",
    aspectRatio: "16:9",
    prompt: "Omoide Yokocho Shinjuku Tokyo lantern lit alleyway yakitori izakaya steam",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    linkedBlogId: "webzine_tokyo_02",
    linkedBlogTitle: "도쿄 미식 & 골목 감성 3박 4일, 시부야부터 나카메구로까지",
    isCover: false,
  },
  {
    id: "img_tokyo_sensoji",
    imageUrl: "https://images.unsplash.com/photo-1513407030348-c983a97b98d8?auto=format&fit=crop&w=800&q=80",
    destination: "도쿄 아사쿠사 센소지",
    style: "전통 오리엔탈",
    lighting: "아침 청명한 빛",
    aspectRatio: "16:9",
    prompt: "Senso-ji Temple Asakusa Tokyo giant red paper lantern pagoda historic shrine",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    linkedBlogId: "webzine_tokyo_02",
    linkedBlogTitle: "도쿄 미식 & 골목 감성 3박 4일, 시부야부터 나카메구로까지",
    isCover: false,
  },
  {
    id: "img_tokyo_nakameguro",
    imageUrl: "https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=800&q=80",
    destination: "도쿄 나카메구로 운하 & 벚꽃길",
    style: "미니멀 감성",
    lighting: "오후 부드러운 햇살",
    aspectRatio: "16:9",
    prompt: "Nakameguro canal Tokyo cherry blossoms walkway trendy coffee roastery",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    linkedBlogId: "webzine_tokyo_02",
    linkedBlogTitle: "도쿄 미식 & 골목 감성 3박 4일, 시부야부터 나카메구로까지",
    isCover: false,
  },

  // --- 3. 제주 (Jeju) ---
  {
    id: "img_jeju_cover",
    imageUrl: "https://images.unsplash.com/photo-1548115184-bc6544d06a58?auto=format&fit=crop&w=1600&q=80",
    destination: "제주도 협재 바다 & 비양도",
    style: "내추럴 힐링",
    lighting: "에메랄드빛 한낮 햇살",
    aspectRatio: "16:9",
    prompt: "Jeju Island clear emerald sea basalt rocks white beach Biyangdo view",
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    linkedBlogId: "webzine_jeju_03",
    linkedBlogTitle: "제주 서쪽 에메랄드빛 바다 & 오름 힐링 2박 3일 감성 로드",
    isCover: true,
  },
  {
    id: "img_jeju_hyeopjae",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    destination: "제주 협재 해수욕장",
    style: "트로피컬 청량",
    lighting: "청명한 정오",
    aspectRatio: "16:9",
    prompt: "Turquoise ocean gentle surf sandy beach crystal clear sea water",
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    linkedBlogId: "webzine_jeju_03",
    linkedBlogTitle: "제주 서쪽 에메랄드빛 바다 & 오름 힐링 2박 3일 감성 로드",
    isCover: false,
  },
  {
    id: "img_jeju_geumoreum",
    imageUrl: "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&w=800&q=80",
    destination: "제주 한림 금오름",
    style: "목가적 힐링",
    lighting: "노을빛 일몰",
    aspectRatio: "16:9",
    prompt: "Jeju volcanic oreum grassy crater hill golden sunset panoramic view",
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    linkedBlogId: "webzine_jeju_03",
    linkedBlogTitle: "제주 서쪽 에메랄드빛 바다 & 오름 힐링 2박 3일 감성 로드",
    isCover: false,
  },

  // --- 4. 생활 살림 (Minimal Life) ---
  {
    id: "img_cleaning_cover",
    imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1600&q=80",
    destination: "미니멀 하우스 & 깔끔한 욕실",
    style: "깨끗한 미니멀리즘",
    lighting: "화사한 자연광",
    aspectRatio: "16:9",
    prompt: "Spotless clean modern white minimalist bathroom interior natural light",
    createdAt: new Date().toISOString(),
    linkedBlogId: "webzine_life_cleaning_04",
    linkedBlogTitle: "자취생 & 주부 필수! 과탄산소다 하나로 끝내는 10분 욕실 살림 청소법",
    isCover: true,
  },
  {
    id: "img_cleaning_sink",
    imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
    destination: "반짝이는 세면대 & 수전",
    style: "화사한 생활",
    lighting: "실내 자연광",
    aspectRatio: "16:9",
    prompt: "Gleaming polished chrome faucet and clean sparkling white ceramic sink",
    createdAt: new Date().toISOString(),
    linkedBlogId: "webzine_life_cleaning_04",
    linkedBlogTitle: "자취생 & 주부 필수! 과탄산소다 하나로 끝내는 10분 욕실 살림 청소법",
    isCover: false,
  },

  // --- 5. 글로벌 인기 여행지 컬렉션 (Global Highlights) ---
  {
    id: "img_swiss_alps",
    imageUrl: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80",
    destination: "스위스 융프라우 & 알프스",
    style: "웅장한 대자연",
    lighting: "설산 맑은 햇살",
    aspectRatio: "16:9",
    prompt: "Swiss Alps snowy peaks green valley alpine village landscape scenic panoramic",
    createdAt: new Date().toISOString(),
    isCover: false,
  },
  {
    id: "img_sydney_opera",
    imageUrl: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=80",
    destination: "시드니 오페라 하우스 & 하버",
    style: "모던 랜드마크",
    lighting: "항구 노을빛",
    aspectRatio: "16:9",
    prompt: "Sydney Opera House Harbour bridge sunset water reflection Australia",
    createdAt: new Date().toISOString(),
    isCover: false,
  },
  {
    id: "img_bali_ubud",
    imageUrl: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
    destination: "발리 우붓 계단식 논 & 열대림",
    style: "에스닉 웰니스",
    lighting: "아침 안개 햇살",
    aspectRatio: "16:9",
    prompt: "Bali Ubud lush green rice terraces palm trees morning mist tropical paradise",
    createdAt: new Date().toISOString(),
    isCover: false,
  },
  {
    id: "img_italy_rome",
    imageUrl: "https://images.unsplash.com/photo-1529154036614-a60975f5c760?auto=format&fit=crop&w=1200&q=80",
    destination: "이탈리아 로마 콜로세움",
    style: "역사 시네마틱",
    lighting: "골든아워",
    aspectRatio: "16:9",
    prompt: "Rome Colosseum ancient Roman architecture warm golden light sunset Italy",
    createdAt: new Date().toISOString(),
    isCover: false,
  },
  {
    id: "img_la_santamonica",
    imageUrl: "https://images.unsplash.com/photo-1580655653885-65763b2597d0?auto=format&fit=crop&w=1200&q=80",
    destination: "로스앤젤레스 산타모니카 피어",
    style: "캘리포니아 바이브",
    lighting: "선셋 파스텔",
    aspectRatio: "16:9",
    prompt: "Santa Monica Pier Ferris wheel California sunset pastel sky ocean coast",
    createdAt: new Date().toISOString(),
    isCover: false,
  },
];

async function migrateImages() {
  console.log("==================================================");
  console.log("📸 Image Migration Script Starting...");
  console.log(`Target Firestore: ${newFirebaseConfig.projectId} [${newFirebaseConfig.firestoreDatabaseId || "(default)"}]`);
  console.log("==================================================");

  const app = initializeApp(newFirebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app, newFirebaseConfig.firestoreDatabaseId || "(default)");

  console.log("Authenticating anonymously...");
  const authUser = await signInAnonymously(auth);
  console.log(`✅ Authenticated with UID: ${authUser.user.uid}`);

  let writtenCount = 0;
  for (const img of GALLERY_IMAGES) {
    try {
      // Write to 'images' collection (Directly allowed by user's security rules)
      const docRef = doc(db, "images", img.id);
      await setDoc(
        docRef,
        {
          ...img,
          createdAtServer: Timestamp.now(),
          migratedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      writtenCount++;
      console.log(`  -> Migrated image [${img.id}]: "${img.destination}"`);
    } catch (err: any) {
      console.error(`  ❌ Failed to write image [${img.id}]:`, err.message);
    }
  }

  console.log("\n[Verification] Reading images from New DB...");
  const snap = await getDocs(collection(db, "images"));
  console.log("==================================================");
  console.log(`🎉 IMAGE MIGRATION COMPLETE!`);
  console.log(`Total Images in 'images' collection: ${snap.size} (Written: ${writtenCount})`);
  console.log("==================================================");

  process.exit(0);
}

migrateImages().catch((e) => {
  console.error("Migration error:", e);
  process.exit(1);
});
