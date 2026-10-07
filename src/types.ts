export interface BlogPost {
  id: string;
  title: string;
  subtitle: string;
  destination: string; // Used as location for travel, or topic name for life info
  duration: string; // e.g., "3박 4일" or "소요시간 5분"
  concept: string; // e.g., "감성 카페 & 해안도로 투어" or "살림/청소 꿀팁"
  tone: string; // e.g., "인스타그램 감성 / 친근한 어조"
  targetAudience: string; // e.g., "커플, 2030 여행객" or "자취생, 주부"
  budget: string; // e.g., "인당 약 40만원" or "비용 0원 (집에 있는 재료)"
  season: string; // e.g., "봄/가을 추천" or "사계절 유용"
  categoryType?: "travel" | "life_info" | "food" | "trend" | "general";
  categoryName?: string; // e.g. "청소/살림", "절약/재테크", "요리/레시피", "맛집/카페", "트렌드"
  metaKeywords: string[];
  hashtags: string[];
  coverImageUrl?: string;
  
  // Structured Itinerary / Step-by-Step Guide
  itinerary: {
    day: number;
    title: string;
    activities: {
      time?: string;
      spot: string;
      description: string;
      tip?: string;
      photoPrompt?: string;
      imageUrl?: string;
    }[];
  }[];

  // Full Markdown Body Content
  markdownContent: string;

  // Travel/Life Tips Callout
  travelTips: string[];

  // SEO Description
  seoDescription: string;

  // Timestamps and Meta
  createdAt: string; // ISO string
  updatedAt: string;
  authorId?: string;
  authorName?: string;
  views: number;
  likes: number;
  status: 'draft' | 'published';
  isPublic?: boolean;

  // Reservation & Auto-scheduling
  isReserved?: boolean;
  scheduledAt?: string; // ISO string of targeted publishing time
  recurrence?: 'none' | 'daily_9am' | 'daily_12pm' | 'weekly';
}

export interface GenerateBlogRequest {
  categoryType?: "travel" | "life_info" | "food" | "trend" | "general";
  destination: string; // Destination or Main Topic
  duration?: string;
  travelStyle?: string; // Travel style or Life Info category
  keywords?: string[];
  tone?: string;
  specificSpots?: string;
  language?: string;
  includeImages?: boolean;
  targetAudience?: string;
}

export interface TravelTemplate {
  id: string;
  title: string;
  categoryType?: "travel" | "life_info" | "food" | "trend" | "general";
  destination: string;
  style: string;
  icon: string;
  description: string;
  duration: string;
  keywords: string[];
  tone: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous?: boolean;
}

export interface GeneratedImage {
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

// SNS Studio Types
export interface CardSlide {
  slideNumber: number;
  badge?: string; // e.g. "HOT SPOT", "꿀팁 01", "체크리스트"
  title: string;
  subtitle?: string;
  points: string[];
  footerNote?: string;
  imageUrl?: string;
  imagePrompt?: string;
}

export interface ShortformScene {
  sceneNumber: number;
  timeRange: string; // e.g. "0:00 - 0:03"
  visualDirection: string; // 화면 연출 가이드
  onScreenText: string; // 화면 자막
  spokenScript: string; // 나레이터 대본
}

export interface SNSPackage {
  id: string;
  topic: string;
  category: "travel" | "life_info" | "food" | "general";
  targetAudience: string;
  tone: string;
  createdAt: string;
  sourceBlogId?: string;
  sourceBlogTitle?: string;
  selectedPlatforms: ("instagram" | "threads" | "twitterX" | "metaFacebook" | "shortform")[];

  // Optional platform outputs depending on user selection
  // 1. Instagram
  instagram?: {
    caption: string;
    hashtags: string[];
    callToAction: string;
    cardSlides: CardSlide[];
  };

  // 2. Threads (타래)
  threads?: {
    posts: string[];
  };

  // 3. X (Twitter)
  twitterX?: {
    tweet: string;
  };

  // 4. Meta (Facebook)
  metaFacebook?: {
    post: string;
  };

  // 5. Shortform (TikTok / Reels / Shorts 대본 - No TTS, No BGM)
  shortform?: {
    title: string;
    hook: string;
    totalDurationSec: number;
    scenes: ShortformScene[];
  };

  // Reservation & Auto-scheduling
  isReserved?: boolean;
  scheduledAt?: string; // ISO string of targeted publishing time
  recurrence?: 'none' | 'daily_9am' | 'daily_12pm' | 'weekly';
  status?: 'draft' | 'published';
}

export interface GenerateSNSRequest {
  topic: string;
  keywords?: string[];
  tone?: string;
  targetAudience?: string;
  category?: "travel" | "life_info" | "food" | "general";
  selectedPlatforms?: ("instagram" | "threads" | "twitterX" | "metaFacebook" | "shortform")[];
  sourceContent?: string; // Optional: blog post content to repurpose
  sourceBlogId?: string;
  sourceBlogTitle?: string;
}

