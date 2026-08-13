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
  categoryType?: "travel" | "life_info";
  categoryName?: string; // e.g. "청소/살림", "절약/재테크", "요리/레시피"
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
}

export interface GenerateBlogRequest {
  categoryType?: "travel" | "life_info";
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
  categoryType?: "travel" | "life_info";
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
}

