export interface BlogPost {
  id: string;
  title: string;
  subtitle: string;
  destination: string;
  duration: string; // e.g., "3박 4일"
  concept: string; // e.g., "감성 카페 & 해안도로 투어"
  tone: string; // e.g., "인스타그램 감성 / 친근한 어조"
  targetAudience: string; // e.g., "커플, 2030 여행객"
  budget: string; // e.g., "인당 약 40만원"
  season: string; // e.g., "봄/가을 추천"
  metaKeywords: string[];
  hashtags: string[];
  coverImageUrl?: string;
  
  // Structured Itinerary
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

  // Travel Tips Callout
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
  destination: string;
  duration?: string;
  travelStyle?: string; // e.g. "감성 여행", "식도락/맛집", "휴양/힐링", "배낭여행/가성비", "가족여행"
  keywords?: string[];
  tone?: string; // e.g. "친근하고 감성적인 체 (해요체)", "전문적이고 상세한 가이드", "위트있고 발랄한 어조"
  specificSpots?: string;
  language?: string;
  includeImages?: boolean;
}

export interface TravelTemplate {
  id: string;
  title: string;
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

